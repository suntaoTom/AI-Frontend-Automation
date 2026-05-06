#!/usr/bin/env bash
# Visual QA 核心脚本：截图 → 像素对比 → 生成报告（Web 版，适用于 UmiJS/Vite 等 web 项目）
#
# 用法:
#   bash docs/designs/screenshots/run-visual-qa.sh
#   bash docs/designs/screenshots/run-visual-qa.sh reference/custom.png
#
# 输出:
#   actual/actual-web.png        实际截图
#   actual/diff.png              差值图（红色=差异区域）
#   actual/side-by-side.png      左右拼接对比图
#   actual/qa-result.json        结构化报告（供 /visual-qa 命令读取）

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
WORKSPACE_DIR="$ROOT_DIR/workspace"

REFERENCE="${1:-$SCRIPT_DIR/reference/xiaoguotu.png}"
ACTUAL_DIR="$SCRIPT_DIR/actual"
ACTUAL_IMG="$ACTUAL_DIR/actual-web.png"
RESULT_JSON="$ACTUAL_DIR/qa-result.json"
DIFF_IMG="$ACTUAL_DIR/diff.png"
SIDE_BY_SIDE="$ACTUAL_DIR/side-by-side.png"
TARGET_SIZE="1440x900"
PORT=8000

mkdir -p "$ACTUAL_DIR"

# ── 颜色输出（全部输出到 stderr，避免污染函数返回值）─────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; NC='\033[0m'; BOLD='\033[1m'

log()  { echo -e "${BLUE}[visual-qa]${NC} $*" >&2; }
ok()   { echo -e "${GREEN}✅${NC} $*" >&2; }
warn() { echo -e "${YELLOW}⚠️ ${NC} $*" >&2; }
fail() { echo -e "${RED}❌${NC} $*" >&2; }

# ── 检查依赖 ──────────────────────────────────────────────────────────────────
check_deps() {
  if ! command -v magick &>/dev/null; then
    warn "ImageMagick 未安装，正在安装..."
    brew install imagemagick
  fi
  if ! command -v npx &>/dev/null; then
    fail "npx 未找到，请先安装 Node.js"
    exit 1
  fi
}

# ── 截图 ──────────────────────────────────────────────────────────────────────
take_screenshot() {
  # 清空整个 actual/ 目录，确保所有产出（截图/diff/JSON）都是本次新生成的
  rm -f "$ACTUAL_DIR"/*

  local dev_pid="" dev_started=false

  # 杀掉可能残留的旧进程，确保拿到最新代码
  lsof -ti tcp:$PORT | xargs kill -9 2>/dev/null || true

  log "启动 dev server（当前源码）..."
  cd "$ROOT_DIR"
  pnpm dev &>/dev/null &
  dev_pid=$!
  dev_started=true

  log "等待 dev server 就绪 (port $PORT, 最多 30s)..."
  for i in $(seq 1 30); do
    curl -s "http://localhost:$PORT" &>/dev/null && break
    sleep 1
  done
  cd "$SCRIPT_DIR"

  log "用 Playwright 截图 http://localhost:$PORT ..."
  cd "$WORKSPACE_DIR"
  npx playwright screenshot \
    --browser chromium \
    --full-page \
    --viewport-size "1440,900" \
    --wait-for-timeout 2000 \
    "http://localhost:$PORT" \
    "$ACTUAL_IMG" >&2

  # 关闭 dev server
  if [[ "$dev_started" == "true" && -n "$dev_pid" ]]; then
    kill "$dev_pid" 2>/dev/null || true
    log "已关闭 dev server"
  fi

  # 验证截图确实产出，否则硬性失败
  if [ ! -f "$ACTUAL_IMG" ]; then
    fail "截图失败，文件不存在: $ACTUAL_IMG"
    exit 1
  fi
  log "截图完成: $ACTUAL_IMG ($(date '+%H:%M:%S'))"
}

# ── 图像对比 ──────────────────────────────────────────────────────────────────
compare_images() {
  if [ ! -f "$REFERENCE" ]; then
    fail "参考图不存在: $REFERENCE"
    fail "请将设计稿截图放入 docs/designs/screenshots/reference/ 目录"
    exit 1
  fi
  if [ ! -f "$ACTUAL_IMG" ]; then
    fail "实际截图不存在: $ACTUAL_IMG"
    exit 1
  fi

  log "对比图像（统一缩放至 $TARGET_SIZE）..."

  magick "$REFERENCE"  -resize "${TARGET_SIZE}!" /tmp/vqa-ref.png 2>/dev/null
  magick "$ACTUAL_IMG" -resize "${TARGET_SIZE}!" /tmp/vqa-act.png 2>/dev/null

  # magick compare 输出格式: "7625.86 (0.116363)" — 括号内是归一化值 (0~1)
  extract_norm_rmse() { grep -oE '\([0-9.]+\)' | tr -d '()' | tail -1; }

  local raw
  raw=$(magick compare -metric RMSE /tmp/vqa-ref.png /tmp/vqa-act.png "$DIFF_IMG" 2>&1 || true)
  RMSE=$(echo "$raw" | extract_norm_rmse || echo "1.0")
  [ -z "$RMSE" ] && RMSE="1.0"

  compare_region() {
    local crop="$1"
    magick /tmp/vqa-ref.png -crop "$crop" +repage /tmp/vqa-r-region.png 2>/dev/null
    magick /tmp/vqa-act.png -crop "$crop" +repage /tmp/vqa-a-region.png 2>/dev/null
    local rraw val
    rraw=$(magick compare -metric RMSE /tmp/vqa-r-region.png /tmp/vqa-a-region.png /tmp/vqa-diff-region.png 2>&1 || true)
    val=$(echo "$rraw" | grep -oE '\([0-9.]+\)' | tr -d '()' | tail -1)
    echo "${val:-1.0}"
  }

  RMSE_TOPBAR=$(compare_region "1440x48+0+0")
  RMSE_PIPELINE=$(compare_region "1440x34+0+48")
  RMSE_BOARD=$(compare_region "1440x700+0+82")

  magick /tmp/vqa-ref.png /tmp/vqa-act.png +append "$SIDE_BY_SIDE" 2>/dev/null

  rm -f /tmp/vqa-ref.png /tmp/vqa-act.png /tmp/vqa-r-region.png /tmp/vqa-a-region.png /tmp/vqa-diff-region.png

  echo "$RMSE|$RMSE_TOPBAR|$RMSE_PIPELINE|$RMSE_BOARD"
}

# ── P0/P1/P2 判定 ─────────────────────────────────────────────────────────────
grade_results() {
  local rmse_total="$1" rmse_topbar="$2" rmse_pipeline="$3"

  local p0_topbar_pass=false p0_pipeline_pass=false p1_pass=false p2_pass=false
  (( $(echo "$rmse_topbar < 0.35"   | bc -l 2>/dev/null || echo 0) )) && p0_topbar_pass=true   || true
  (( $(echo "$rmse_pipeline < 0.35" | bc -l 2>/dev/null || echo 0) )) && p0_pipeline_pass=true || true
  (( $(echo "$rmse_total < 0.25"    | bc -l 2>/dev/null || echo 0) )) && p1_pass=true           || true
  (( $(echo "$rmse_total < 0.15"    | bc -l 2>/dev/null || echo 0) )) && p2_pass=true           || true

  echo "$p0_topbar_pass|$p0_pipeline_pass|$p1_pass|$p2_pass"
}

# ── 写 JSON 报告 ──────────────────────────────────────────────────────────────
write_json() {
  local rmse_total="$1" rmse_topbar="$2" rmse_pipeline="$3" rmse_board="$4"
  local p0_topbar="$5" p0_pipeline="$6" p1="$7" p2="$8"
  local ts; ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  cat > "$RESULT_JSON" <<JSON
{
  "timestamp": "$ts",
  "mode": "web",
  "reference": "$REFERENCE",
  "actual": "$ACTUAL_IMG",
  "diff": "$DIFF_IMG",
  "sideBySide": "$SIDE_BY_SIDE",
  "metrics": {
    "rmse": { "total": $rmse_total, "topbar": $rmse_topbar, "pipeline": $rmse_pipeline, "board": $rmse_board }
  },
  "grades": {
    "P0_topbar":   { "pass": $p0_topbar,   "threshold": 0.35, "label": "TopBar 结构" },
    "P0_pipeline": { "pass": $p0_pipeline, "threshold": 0.35, "label": "Pipeline 结构" },
    "P1":          { "pass": $p1,          "threshold": 0.25, "label": "视觉 Token 整体" },
    "P2":          { "pass": $p2,          "threshold": 0.15, "label": "像素级精确度" }
  }
}
JSON
}

# ── 打印报告 ──────────────────────────────────────────────────────────────────
print_report() {
  local p0_topbar="$1" p0_pipeline="$2" p1="$3" p2="$4"
  local rmse_total="$5" rmse_topbar="$6" rmse_pipeline="$7"

  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  📸 Visual QA 对比结果${NC}  [模式: web]"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  local p0_icon="✅"
  [[ "$p0_topbar" == "false" || "$p0_pipeline" == "false" ]] && p0_icon="❌"
  echo -e "$p0_icon P0 结构"
  echo    "     TopBar    RMSE=$rmse_topbar  阈值<0.35  $( [[ "$p0_topbar"   == "true" ]] && echo '✅' || echo '❌ 必须修复' )"
  echo    "     Pipeline  RMSE=$rmse_pipeline  阈值<0.35  $( [[ "$p0_pipeline" == "true" ]] && echo '✅' || echo '❌ 必须修复' )"

  local p1_icon="✅"; [[ "$p1" == "false" ]] && p1_icon="⚠️ "
  echo -e "$p1_icon P1 视觉 Token  RMSE=$rmse_total  阈值<0.25  $( [[ "$p1" == "true" ]] && echo '✅' || echo '⚠️  建议修复' )"

  local p2_icon="✅"; [[ "$p2" == "false" ]] && p2_icon="📌"
  echo -e "$p2_icon P2 像素精确  RMSE=$rmse_total  阈值<0.15  $( [[ "$p2" == "true" ]] && echo '✅' || echo '📌 记录，不阻塞' )"

  echo ""
  echo "产出文件:"
  echo "  差值图:  $DIFF_IMG"
  echo "  对比图:  $SIDE_BY_SIDE"
  echo "  JSON:   $RESULT_JSON"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ── 主流程 ────────────────────────────────────────────────────────────────────
main() {
  log "开始 Visual QA..."
  check_deps
  take_screenshot

  METRICS=$(compare_images)
  RMSE_TOTAL=$(echo "$METRICS" | cut -d'|' -f1)
  RMSE_TOPBAR=$(echo "$METRICS" | cut -d'|' -f2)
  RMSE_PIPELINE=$(echo "$METRICS" | cut -d'|' -f3)
  RMSE_BOARD=$(echo "$METRICS" | cut -d'|' -f4)

  GRADES=$(grade_results "$RMSE_TOTAL" "$RMSE_TOPBAR" "$RMSE_PIPELINE")
  P0_TOPBAR=$(echo "$GRADES" | cut -d'|' -f1)
  P0_PIPELINE=$(echo "$GRADES" | cut -d'|' -f2)
  P1=$(echo "$GRADES" | cut -d'|' -f3)
  P2=$(echo "$GRADES" | cut -d'|' -f4)

  write_json "$RMSE_TOTAL" "$RMSE_TOPBAR" "$RMSE_PIPELINE" "$RMSE_BOARD" \
    "$P0_TOPBAR" "$P0_PIPELINE" "$P1" "$P2"

  print_report "$P0_TOPBAR" "$P0_PIPELINE" "$P1" "$P2" \
    "$RMSE_TOTAL" "$RMSE_TOPBAR" "$RMSE_PIPELINE"

  if [[ "$P0_TOPBAR" == "false" || "$P0_PIPELINE" == "false" ]]; then
    exit 2
  fi
}

main "$@"
