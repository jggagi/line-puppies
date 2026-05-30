import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import os

# Set page config FIRST before any other streamlit commands
st.set_page_config(
    page_title="Trading Master",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Imports after page config
import config
from data_layer import get_fetcher
from state_layer import LocalDocumentParser
from agent_layer.attribution import AttributionEngine
from agent_layer.critique import MasterCritiqueEngine
from ui.components import (
    inject_custom_css,
    render_header,
    render_metric_card,
    render_persona_card,
    render_news_item,
    render_info_banner
)

# 1. Inject Premium Custom Styling
inject_custom_css()

# 2. Main Title Header
render_header("Trading Master Attribution & Critique", "Sovereign local-first financial intelligence roundtable.")

# 3. Sidebar Parameter Controller
with st.sidebar:
    st.markdown("## System Controls")
    
    # Provider Selection
    provider_option = st.selectbox(
        "Market Data Provider",
        ["Yahoo Finance", "Google Finance (Mock)"],
        index=0,
        help="Select live Yahoo Finance or simulated Google Finance mock provider."
    )
    provider_id = "yahoo" if provider_option == "Yahoo Finance" else "google"
    
    # Ticker Input
    ticker_input = st.text_input(
        "Target Ticker",
        value="QQQ",
        help="Stock or ETF ticker symbol to analyze."
    ).strip().upper()
    
    # Lookback Period
    period_option = st.select_slider(
        "Lookback Horizon",
        options=["1mo", "3mo", "6mo", "1y"],
        value="1mo",
        help="Historical price range to retrieve."
    )
    
    st.markdown("---")
    st.markdown("### LLM API Settings")
    
    # Provider Selection for LLM
    llm_provider = st.selectbox(
        "LLM Model Provider",
        ["Gemini", "OpenAI"],
        index=0,
        help="Stateless LLM client to drive analytics and investor critiques."
    ).lower()
    
    # Dynamic API Key collection from UI if missing in Env
    env_gemini_key = os.getenv("GEMINI_API_KEY", "")
    env_openai_key = os.getenv("OPENAI_API_KEY", "")
    
    user_gemini_key = ""
    user_openai_key = ""
    
    if llm_provider == "gemini":
        if not env_gemini_key:
            user_gemini_key = st.text_input("Enter Gemini API Key", type="password", help="Input your Google AI Studio API key statelessly.")
            if user_gemini_key:
                active_api_key = user_gemini_key
            else:
                active_api_key = None
                render_info_banner("No GEMINI_API_KEY found in .env. Enter one above to enable LLM modules.")
        else:
            active_api_key = env_gemini_key
            st.success("Gemini API Key detected (.env)")
    else:
        if not env_openai_key:
            user_openai_key = st.text_input("Enter OpenAI API Key", type="password", help="Input your OpenAI API key statelessly.")
            if user_openai_key:
                active_api_key = user_openai_key
            else:
                active_api_key = None
                render_info_banner("No OPENAI_API_KEY found in .env. Enter one above to enable LLM modules.")
        else:
            active_api_key = env_openai_key
            st.success("OpenAI API Key detected (.env)")
            
    st.markdown("---")
    
    # Action Trigger Button
    run_btn = st.button("🚀 Run Analysis")

# Initialize Session State to persist results across tab changes
if "analysis_complete" not in st.session_state:
    st.session_state.analysis_complete = False
    st.session_state.prices_df = None
    st.session_state.news_list = None
    st.session_state.attribution = None
    st.session_state.critiques = None
    st.session_state.portfolio = None
    st.session_state.ticker_ran = ""

# 4. Trigger Analysis Process
if run_btn:
    if not active_api_key:
        st.error("Missing API Key! Please configure the API Key in the sidebar or `.env` file before executing analysis.")
    else:
        # Visual Progress Steps
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        try:
            # Step 1: Retrieve Market Data
            status_text.markdown("⚡ *Step 1: Connecting to Market Data provider...*")
            progress_bar.progress(15)
            
            fetcher = get_fetcher(provider_id)
            prices_df = fetcher.get_historical_prices(ticker_input, period_option)
            news_list = fetcher.get_recent_news(ticker_input)
            
            # Step 2: Retrieve Local Portfolio State
            status_text.markdown("⚡ *Step 2: Accessing sovereign local portfolio stub...*")
            progress_bar.progress(40)
            
            portfolio_parser = LocalDocumentParser()
            portfolio_state = portfolio_parser.get_portfolio_state()
            
            # Step 3: Run Attribution Synthesis
            status_text.markdown("⚡ *Step 3: Synthesizing news and price attribution...*")
            progress_bar.progress(65)
            
            attribution_engine = AttributionEngine()
            attribution = attribution_engine.analyze(
                ticker=ticker_input,
                prices_df=prices_df,
                news_list=news_list,
                provider=llm_provider,
                api_key=active_api_key
            )
            
            # Step 4: Run Master Critique Roundtable
            status_text.markdown("⚡ *Step 4: Running Master Critique roundtable loop...*")
            progress_bar.progress(85)
            
            critique_engine = MasterCritiqueEngine()
            critiques = critique_engine.run_critique(
                ticker=ticker_input,
                attribution_summary=attribution.get("summary", ""),
                price_trend=attribution.get("price_trend", "Unknown"),
                sentiment=attribution.get("sentiment", "Neutral"),
                provider=llm_provider,
                api_key=active_api_key
            )
            
            # Save to session state
            st.session_state.prices_df = prices_df
            st.session_state.news_list = news_list
            st.session_state.attribution = attribution
            st.session_state.critiques = critiques
            st.session_state.portfolio = portfolio_state
            st.session_state.ticker_ran = ticker_input
            st.session_state.analysis_complete = True
            
            progress_bar.progress(100)
            status_text.success("✅ Analysis completed successfully!")
            
        except Exception as e:
            st.error(f"Execution failed: {str(e)}")
            progress_bar.empty()
            status_text.empty()

# 5. Core Application Workspace Layout
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Market Analytics", 
    "✍️ Attribution Engine", 
    "🎓 Master Critique Roundtable", 
    "🔒 Secure Portfolio State"
])

if st.session_state.analysis_complete:
    ticker = st.session_state.ticker_ran
    df = st.session_state.prices_df
    news = st.session_state.news_list
    attr = st.session_state.attribution
    critiques = st.session_state.critiques
    portfolio = st.session_state.portfolio

    # ==================== TAB 1: MARKET ANALYTICS ====================
    with tab1:
        st.markdown(f"### Market Analytics for `{ticker}`")
        
        # Grid layout for price metrics
        col1, col2, col3, col4, col5 = st.columns(5)
        
        start_p = float(df['Close'].iloc[0])
        end_p = float(df['Close'].iloc[-1])
        change_pct = ((end_p - start_p) / start_p) * 100
        high_p = float(df['High'].max())
        low_p = float(df['Low'].min())
        
        trend_class = "positive" if change_pct >= 0 else "negative"
        
        with col1:
            render_metric_card("Start Close", f"${start_p:.2f}")
        with col2:
            render_metric_card("Latest Close", f"${end_p:.2f}")
        with col3:
            render_metric_card("Price Change", f"{change_pct:+.2f}%", trend_class)
        with col4:
            render_metric_card("Period High", f"${high_p:.2f}")
        with col5:
            render_metric_card("Period Low", f"${low_p:.2f}")
            
        st.markdown("<br/>", unsafe_allow_html=True)
        
        # Grid for chart + news list
        chart_col, news_col = st.columns([3, 2])
        
        with chart_col:
            st.markdown("#### Interactive Chart")
            # Build clean Plotly interactive Candlestick chart
            fig = go.Figure()
            fig.add_trace(go.Candlestick(
                x=df.index,
                open=df['Open'],
                high=df['High'],
                low=df['Low'],
                close=df['Close'],
                name=ticker,
                increasing_line_color='#3fb950',  # Clean green
                decreasing_line_color='#f85149'   # Clean red
            ))
            
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(l=20, r=20, t=10, b=20),
                xaxis_rangeslider_visible=False,
                xaxis=dict(
                    showgrid=True,
                    gridcolor='rgba(255, 255, 255, 0.05)',
                    color='#8b949e'
                ),
                yaxis=dict(
                    showgrid=True,
                    gridcolor='rgba(255, 255, 255, 0.05)',
                    color='#8b949e',
                    side='right'
                ),
                height=450
            )
            st.plotly_chart(fig, use_container_width=True)
            
        with news_col:
            st.markdown("#### Timeline Indicators (News Context)")
            if news:
                # Scrollable box for news list
                st.markdown('<div style="max-height: 440px; overflow-y: auto; border: 1px solid rgba(212,175,55,0.1); border-radius: 8px; padding: 10px;">', unsafe_allow_html=True)
                for item in news:
                    render_news_item(
                        title=item.get("title"),
                        publisher=item.get("publisher"),
                        published=item.get("published"),
                        link=item.get("link")
                    )
                st.markdown('</div>', unsafe_allow_html=True)
            else:
                st.info("No timeline news indicators available for this lookback period.")

    # ==================== TAB 2: ATTRIBUTION ENGINE ====================
    with tab2:
        st.markdown(f"### Objective Macro-News Attribution")
        
        # Attribution Narrative Container
        st.markdown('<div class="premium-card">', unsafe_allow_html=True)
        st.markdown(f"**Attributed Sentiment**: `{attr.get('sentiment', 'Neutral')}`  |  **Calculated Trend**: `{attr.get('price_trend', 'Sideways')}`")
        st.markdown("---")
        st.markdown(attr.get("summary", "No attribution narrative was generated."))
        st.markdown('</div>', unsafe_allow_html=True)
        
        # List of key market events
        st.markdown("#### Primary Drivers Identified")
        events = attr.get("key_events", [])
        if events:
            for event in events:
                st.markdown(f"- 🔸 **{event}**")
        else:
            st.info("No explicit primary drivers were compiled.")

    # ==================== TAB 3: MASTER CRITIQUE ROUNDTABLE ====================
    with tab3:
        st.markdown("### Master Investor Roundtable Evaluations")
        
        # Two-by-two grid for critiques
        grid_col1, grid_col2 = st.columns(2)
        
        personas = [
            ("Warren Buffett", "Value Investing Moat Guard", "WB", critiques.get("Warren Buffett", "")),
            ("Charlie Munger", "Latticework of Mental Models", "CM", critiques.get("Charlie Munger", "")),
            ("Duan Yongping", "Ben Fen - Integrity & Focus", "DY", critiques.get("Duan Yongping", "")),
            ("Ray Dalio", "Macroeconomic Debt Cycles", "RD", critiques.get("Ray Dalio", ""))
        ]
        
        with grid_col1:
            render_persona_card(*personas[0])
            render_persona_card(*personas[2])
            
        with grid_col2:
            render_persona_card(*personas[1])
            render_persona_card(*personas[3])

    # ==================== TAB 4: SECURE PORTFOLIO STATE ====================
    with tab4:
        st.markdown("### Sovereign Local Portfolio Parser")
        
        # Display Stub State
        st.json(portfolio)
        
        # Privacy and Architecture Notice
        st.info(
            "🔒 **Data Sovereignty Guarantee**: Your raw financial files are sacred. The Local Portfolio module "
            "operates exclusively in local memory. During Phase 2, statement parsing libraries (e.g. PyPDF2) will "
            "extract allocations locally. At no point will raw document text or sensitive credentials be sent to "
            "external extraction APIs. Only parsed asset balances are loaded statelessly into memory."
        )

else:
    # Initial landing view when no analysis is run yet
    st.markdown(
        """
        <div class="premium-card" style="text-align: center; padding: 60px 40px; margin-top: 30px;">
            <div style="font-size: 64px; margin-bottom: 20px;">⚡</div>
            <h2 style="font-size: 28px; margin-bottom: 8px;">Awaiting Execution</h2>
            <p style="color: #8b949e; max-width: 600px; margin: 0 auto 24px auto; font-size: 15px; line-height: 1.6;">
                Configure the target ticker, market data provider, and LLM settings in the sidebar panel. 
                Click <b>Execute Core Analysis</b> to load market price streams and initiate the Master Critique roundtable.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )
