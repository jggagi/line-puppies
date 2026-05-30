import streamlit as st

def inject_custom_css():
    """Reads styles.css and injects it into Streamlit's head."""
    try:
        with open("ui/styles.css", "r") as f:
            css = f.read()
        st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)
    except Exception as e:
        # Fallback if file isn't loaded correctly
        pass

def render_header(title: str, subtitle: str):
    """Renders a styled page header with a premium theme gradient."""
    st.markdown(
        f"""
        <div style='margin-bottom: 24px;'>
            <h1 style='font-size: 36px; margin-bottom: 4px; background: linear-gradient(135deg, #ffffff 0%, #c5a059 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>{title}</h1>
            <p style='color: #8b949e; font-size: 16px; margin: 0;'>{subtitle}</p>
        </div>
        """,
        unsafe_allow_html=True
    )

def render_metric_card(label: str, val_str: str, trend: str = "neutral"):
    """Renders a premium visual metric display."""
    color_class = "neutral"
    if trend == "positive":
        color_class = "positive"
    elif trend == "negative":
        color_class = "negative"
        
    st.markdown(
        f"""
        <div class="metric-box">
            <div style="font-size: 13px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px;">{label}</div>
            <div class="metric-val {color_class}">{val_str}</div>
        </div>
        """,
        unsafe_allow_html=True
    )

def render_persona_card(name: str, tagline: str, initial: str, critique: str):
    """Renders an expert persona response in a beautiful premium card panel."""
    # Escape any HTML characters in critique safely
    safe_critique = critique.replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
    
    st.markdown(
        f"""
        <div class="premium-card">
            <div class="persona-header">
                <div class="persona-avatar">{initial}</div>
                <div>
                    <div class="persona-name">{name}</div>
                    <div class="persona-tagline">{tagline}</div>
                </div>
            </div>
            <div style="font-size: 15px; line-height: 1.6; color: #e6edf3;">
                {safe_critique}
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

def render_news_item(title: str, publisher: str, published: str, link: str):
    """Renders a styled news item inside the data panel."""
    st.markdown(
        f"""
        <div class="news-item">
            <a href="{link}" target="_blank" class="news-title">{title}</a>
            <div class="news-meta">
                <span>📰 {publisher}</span>
                <span>⏰ {published}</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

def render_info_banner(message: str):
    """Renders a custom gold/bronze sidebar banner."""
    st.markdown(
        f"""
        <div class="banner-info">
            <div style="font-weight: 600; color: #d4af37; margin-bottom: 4px; font-size: 14px;">SYSTEM NOTICE</div>
            <div style="font-size: 13px; color: #e6edf3; line-height: 1.4;">{message}</div>
        </div>
        """,
        unsafe_allow_html=True
    )
