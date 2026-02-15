"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const EmbedCard = ({ ownerId }: { ownerId: string }) => {
    const navigate = useRouter();
    const [copied, setCopied] = useState(false);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    const embedCode = `
        <script src="${baseUrl}/weaveBot.js" data-ownerId="${ownerId}" data-api-base-url="${baseUrl}" data-font-mode="bot">
        </script>
    `;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        toast.success("Code Copied");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navigation */}
            <motion.nav
                initial={{ y: -70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 w-full z-50"
            >
                <div className="relative backdrop-blur-2xl bg-background/30 border-b border-border shadow-xl">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[400px] h-[120px] bg-primary/10 blur-[120px] rounded-full" />

                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 cursor-pointer group relative"
                            onClick={() => navigate.push("/")}
                        >
                            <Image src="/globe.svg" alt="logo" height={36} width={36} />
                            <p className="text-lg font-semibold text-foreground tracking-wide">
                                Bot<span className="text-primary">Weave</span>
                            </p>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-3/4 transition-all duration-500" />
                        </motion.div>

                        {/* Dashboard Button */}
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            className="group relative px-7 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold tracking-wide shadow-lg overflow-hidden cursor-pointer"
                            onClick={() => navigate.push("/dashboard")}
                        >
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-primary/10 to-transparent transition duration-500" />
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-3/4 transition-all duration-500" />
                            <span className="relative z-10">Back to Dashboard</span>
                        </motion.button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                </div>
            </motion.nav>

            {/* Embed Code Section */}
            <div className="flex justify-center px-4 py-24 mt-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative w-full max-w-6xl rounded-[30px] bg-card textured border border-border shadow-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(212,168,83,0.06),transparent_40%)]" />

                    <div className="grid lg:grid-cols-[1fr_1.25fr] gap-20 p-12 lg:p-20">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="flex flex-col justify-center space-y-12"
                        >
                            <div>
                                <span className="text-[10px] tracking-[0.7em] text-muted-foreground">
                                    QUICK INTEGRATION
                                </span>
                                <h1 className="text-4xl font-semibold mt-4 leading-tight gold-text">
                                    Embed Your AI Assistant
                                </h1>
                                <p className="text-sm mt-4 max-w-sm leading-relaxed text-muted-foreground">
                                    A single lightweight script transforms your website into a real-time conversational experience. No installs. No SDK. No dependencies.
                                </p>
                                <p className="text-sm font-medium mt-4 text-primary">
                                    Copy Script
                                </p>
                            </div>

                            {/* Steps */}
                            <div className="space-y-6">
                                {[
                                    ["Copy Script", "Click copy or manually select the code."],
                                    ["Paste in HTML", "Place before closing body tag."],
                                    ["Reload Website", "Assistant appears automatically."],
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary text-xs font-semibold">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm font-medium">{step[0]}</p>
                                            <p className="text-muted-foreground text-xs">{step[1]}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Code Block */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl bg-secondary border border-border shadow-xl overflow-hidden">
                                {/* Code Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/40">
                                    <div className="flex gap-2">
                                        <span className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
                                        <span className="w-2.5 h-2.5 bg-yellow-400/80 rounded-full" />
                                        <span className="w-2.5 h-2.5 bg-green-500/80 rounded-full" />
                                    </div>
                                    <span className="text-[10px] tracking-[0.4em] text-muted-foreground">
                                        index.html
                                    </span>
                                    <span className="text-[10px] tracking-[0.4em] gold-border px-2 py-0.5 rounded font-semibold">
                                        ACTIVE
                                    </span>
                                </div>

                                {/* Code Content */}
                                <div className="relative p-10 font-mono text-[13px] leading-7">
                                    <div className="text-muted-foreground mb-3">
                                        // place before &lt;/body&gt;
                                    </div>
                                    <pre className="whitespace-pre-wrap break-words font-mono text-[14px] leading-7 text-primary">
                                        {embedCode}
                                    </pre>

                                    {/* Copy Button */}
                                    <button
                                        onClick={handleCopy}
                                        disabled={copied}
                                        className="absolute top-6 right-6 px-4 py-1.5 rounded-md text-[11px] font-semibold bg-background border border-border text-primary hover:bg-secondary transition cursor-pointer"
                                    >
                                        {copied ? "Copied ✓" : "Copy"}
                                    </button>
                                </div>
                            </div>

                            <p className="text-[11px] text-muted-foreground mt-5 text-center">
                                Lightweight • Secure • Universal Compatibility
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Live Preview Section */}
            <div className="flex justify-center px-4 pb-24 mt-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative w-full max-w-6xl rounded-2xl border border-border bg-card textured shadow-2xl overflow-hidden"
                >
                    {/* Preview Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/40 backdrop-blur">
                        <div className="flex gap-2">
                            <span className="w-3 h-3 bg-red-500/80 rounded-full" />
                            <span className="w-3 h-3 bg-yellow-400/80 rounded-full" />
                            <span className="w-3 h-3 bg-green-500/80 rounded-full" />
                        </div>
                        <span className="text-xs tracking-[0.3em] text-muted-foreground">
                            LIVE PREVIEW
                        </span>
                        <span className="text-xs text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded">
                            ACTIVE
                        </span>
                    </div>

                    {/* Preview Content */}
                    <div className="grid lg:grid-cols-2 gap-10 p-8 lg:p-5 bg-gradient-to-br from-background via-card to-secondary">
                        {/* Left Text */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="flex flex-col justify-center space-y-5"
                        >
                            <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-foreground">
                                This Chat Looks
                                <span className="gold-text">
                                    {" "}Exactly Like{" "}
                                </span>
                                Your Website
                            </h1>
                            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                                The AI assistant automatically adapts to your site theme. Visitors can chat instantly while browsing — without breaking your design or layout.
                            </p>
                            <div className="flex gap-3 mt-3">
                                <span className="px-3 py-1 text-xs border border-border rounded-lg text-muted-foreground">
                                    Instant Replies
                                </span>
                                <span className="px-3 py-1 text-xs border border-border rounded-lg text-muted-foreground">
                                    Mobile Friendly
                                </span>
                                <span className="px-3 py-1 text-xs border border-border rounded-lg text-muted-foreground">
                                    Auto Theme
                                </span>
                            </div>
                        </motion.div>

                        {/* Right Chat Preview */}
                        <div className="relative min-h-[500px] flex items-end justify-center lg:justify-end pt-6">
                            <div className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-card to-background border border-border shadow-2xl flex items-center justify-center text-foreground text-xl">
                                💬
                            </div>

                            {/* Chat Panel */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="relative mb-24 w-[95%] sm:w-[340px] h-[400px] rounded-2xl bg-card/95 textured backdrop-blur-xl border border-border shadow-2xl flex flex-col overflow-hidden"
                            >
                                {/* Chat Header */}
                                <div className="px-5 py-4 flex justify-between items-center border-b border-border bg-background/40">
                                    <div className="flex gap-2">
                                        <span className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
                                        <span className="w-2.5 h-2.5 bg-yellow-400/80 rounded-full" />
                                        <span className="w-2.5 h-2.5 bg-green-500/80 rounded-full" />
                                    </div>
                                    <span className="text-xs tracking-[0.25em] font-semibold gold-text">
                                        AI ASSISTANT
                                    </span>
                                    <span className="text-muted-foreground text-sm">✕</span>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 p-4 flex flex-col gap-3 text-xs overflow-y-auto">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="self-start px-4 py-2 rounded-xl bg-secondary border border-border text-foreground max-w-[80%]"
                                    >
                                        Hello 👋 How can I help you?
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="self-end px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-md max-w-[80%]"
                                    >
                                        Do you offer support?
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.2 }}
                                        className="self-start px-4 py-2 rounded-xl bg-secondary border border-border text-foreground max-w-[80%]"
                                    >
                                        Yes, 24/7 support available.
                                    </motion.div>
                                </div>

                                {/* Chat Input */}
                                <div className="p-4 border-t border-border flex gap-2">
                                    <input
                                        disabled
                                        placeholder="Type a message..."
                                        className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground"
                                    />
                                    <button disabled className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md">
                                        ➤
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EmbedCard;
