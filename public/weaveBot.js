(function () {
    const scriptTag = document.currentScript;
    const ownerId = scriptTag?.getAttribute("data-ownerId");
    const apiBaseFromAttr = scriptTag?.getAttribute("data-api-base-url");
    const fontMode = (scriptTag?.getAttribute("data-font-mode") || "bot").toLowerCase();
    const customFontFamily = scriptTag?.getAttribute("data-font-family")?.trim();
    const scriptOrigin = scriptTag?.src
        ? new URL(scriptTag.src, window.location.href).origin
        : window.location.origin;
    const apiBase = (apiBaseFromAttr || scriptOrigin || window.location.origin || "http://localhost:3000").replace(/\/$/, "");
    const api_url = `${apiBase}/api/conversation`;

    const theme = {
        background: "#1a1714",
        foreground: "#e8e0d4",
        card: "#221f1a",
        primary: "#d4a853",
        primaryForeground: "#1a1714",
        secondary: "#2e2a24",
        mutedForeground: "#8a7e6b",
        border: "#3a352e",
        input: "#2a2520",
    };
    const defaultBotFont = "'Architects Daughter', Inter, system-ui, sans-serif";
    const resolvedFontFamily = customFontFamily || (fontMode === "inherit" ? "inherit" : defaultBotFont);

    if (!ownerId) return console.error("ownerId missing");

    const button = document.createElement("div");
    button.innerHTML = "💬";

    Object.assign(button.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: "99999",
        cursor: "pointer",
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: `linear-gradient(145deg, ${theme.card}, ${theme.background})`,
        color: theme.foreground,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
        border: `1px solid ${theme.border}`,
        transition: "all .25s ease",
    });

    setInterval(() => {
        button.style.boxShadow = `0 25px 60px rgba(0,0,0,0.55), 0 0 18px rgba(212,168,83,0.45)`;
        setTimeout(() => {
            button.style.boxShadow = "0 25px 60px rgba(0,0,0,0.55)";
        }, 900);
    }, 2500);

    document.body.append(button);

    const box = document.createElement("div");

    function responsive() {
        const mobile = window.innerWidth < 520;

        if (mobile) {
            Object.assign(box.style, {
                bottom: "16px",
                right: "12px",
                left: "12px",
                width: "auto",
                height: "70vh",
                borderRadius: "22px",
            });
        } else {
            Object.assign(box.style, {
                bottom: "92px",
                right: "22px",
                left: "auto",
                width: "390px",
                height: "560px",
                borderRadius: "26px",
            });
        }
    }

    Object.assign(box.style, {
        position: "fixed",
        zIndex: "99999",
        background: `linear-gradient(180deg, ${theme.card}F2, ${theme.card}F2), radial-gradient(circle at top right, rgba(212,168,83,0.09), transparent 42%)`,
        backdropFilter: "blur(22px)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.65)",
        border: `1px solid ${theme.border}`,
        display: "none",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: resolvedFontFamily,
        color: theme.foreground,
    });

    responsive();
    window.addEventListener("resize", responsive);

    box.innerHTML = `
        <div style="padding:16px 18px;display:flex;justify-content:space-between;align-items:center;background:rgba(26,23,20,0.4);border-bottom:1px solid ${theme.border}">
            <div style="display:flex;gap:8px">
                <span style="width:11px;height:11px;background:#ff5f57;border-radius:50%"></span>
                <span style="width:11px;height:11px;background:#febc2e;border-radius:50%"></span>
                <span style="width:11px;height:11px;background:#28c840;border-radius:50%"></span>
            </div>
            <span style="font-size:12px;letter-spacing:.25em;font-weight:700;background:linear-gradient(90deg,${theme.primary},#e8c56d);-webkit-background-clip:text;color:transparent">
                AI ASSISTANT
            </span>
            <span id="chat-close" style="cursor:pointer;font-size:18px;opacity:.75;color:${theme.mutedForeground};">✕</span>
        </div>
        <div id="chat-messages" style="flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;min-width:0;word-break:break-word;"></div>
        <div style="padding:14px;border-top:1px solid ${theme.border};display:flex;gap:10px;background:rgba(26,23,20,0.35)">
            <input id="chat-input" placeholder="Type a message..." style="flex:1;padding:10px 12px;border-radius:12px;border:1px solid ${theme.border};background:${theme.input};color:${theme.foreground};outline:none;font-size:13px" />
            <button id="chat-send" style="padding:10px 12px;border-radius:12px;border:none;background:${theme.primary};color:${theme.primaryForeground};font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.25)">➤</button>
        </div>
    `;

    document.body.append(box);

    button.onclick = () => (box.style.display = box.style.display === "none" ? "flex" : "none");

    document.addEventListener("click", (e) => {
        if (e.target.id === "chat-close") box.style.display = "none";
    });

    const sendBtn = box.querySelector("#chat-send");
    const input = box.querySelector("#chat-input");
    const messageArea = box.querySelector("#chat-messages");

    function bubble(text, from) {
        const el = document.createElement("div");
        el.innerText = text;

        Object.assign(el.style, {
            maxWidth: "85%",
            minWidth: "0",
            padding: "10px 14px",
            borderRadius: "12px",
            fontSize: "13px",
            lineHeight: "1.45",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            background: from === "user" ? theme.primary : theme.secondary,
            color: from === "user" ? theme.primaryForeground : theme.foreground,
            alignSelf: from === "user" ? "flex-end" : "flex-start",
            border: `1px solid ${theme.border}`,
            boxShadow: from === "user" ? "0 6px 16px rgba(0,0,0,0.18)" : "0 6px 16px rgba(0,0,0,0.28)",
        });

        messageArea.append(el);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    function typing() {
        const t = document.createElement("div");
        t.innerHTML = "● ● ●";

        Object.assign(t.style, {
            opacity: ".7",
            fontSize: "12px",
            alignSelf: "flex-start",
            wordBreak: "break-word",
            color: theme.mutedForeground,
        });

        return t;
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        bubble(text, "user");
        input.value = "";

        const t = typing();
        messageArea.append(t);

        try {
            const res = await fetch(api_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ownerId, message: text }),
            });

            const data = await res.json();
            t.remove();

            let botText = "";

            if (res.ok) {
                botText = typeof data === "string" ? data : data.reply || data.message || "I am here to help!";
            } else {
                const raw = typeof data === "string" ? data : JSON.stringify(data);

                if (raw.includes("quota") || raw.includes("RESOURCE_EXHAUSTED")) {
                    botText = "⚠️ AI limit reached. Please try again after a few seconds.";
                } else if (raw.includes("network")) {
                    botText = "🌐 Network issue. Please check your internet connection.";
                } else if (raw.includes("server")) {
                    botText = "🚧 Server is busy right now. Please try again later.";
                } else {
                    botText = "❌ Something went wrong. Please try again.";
                }
            }

            bubble(botText, "bot");
        } catch (err) {
            t.remove();

            let msg = "❌ Unexpected error occurred.";
            if (err.message?.includes("fetch")) {
                msg = "🌐 Unable to connect. Check internet.";
            }

            bubble(msg, "bot");
        }
    }

    sendBtn.onclick = sendMessage;
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
})();
