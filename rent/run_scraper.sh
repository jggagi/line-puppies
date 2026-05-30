#!/bin/bash
# ==============================================================================
# 上海租房地图 (Shanghai Rental Map) Crawler Runner
# Auto setups Python dependencies and runs the scraper.py
# ==============================================================================

# Get current script folder directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "======================================================================"
echo "上海租房地图 数据源抓取与同步启动中..."
echo "时间: $(date)"
echo "目录: $SCRIPT_DIR"
echo "======================================================================"

# Check if python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 系统未检测到 python3，请先安装 Python 运行环境。"
    exit 1
fi

echo "🔍 检查 Python 依赖库..."

# Try to import requests and bs4, if missing install them via pip
python3 -c "import requests, bs4" &> /dev/null
if [ $? -ne 0 ]; then
    echo "📦 缺少依赖库，正在通过 pip 安装 requests 和 beautifulsoup4..."
    python3 -m pip install requests beautifulsoup4
    
    if [ $? -ne 0 ]; then
        echo "⚠️  警告: pip 安装依赖失败。脚本将尝试使用系统默认的 urllib 库进行基础解析抓取。"
    else
        echo "✅ 依赖库安装成功！"
    fi
else
    echo "✅ Python 依赖库检查通过。"
fi

echo "🚀 执行房源抓取核心引擎..."
python3 "$SCRIPT_DIR/scraper.py"

if [ $? -eq 0 ]; then
    echo "🎉 数据抓取与本地同步成功！"
    echo "您可以直接在网页浏览器中刷新「上海租房地图」查看更新！"
else
    echo "❌ 数据同步出错，请检查网络连接或目标网站结构变动。"
fi
echo "======================================================================"
