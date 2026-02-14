"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

function DashboardHome({ ownerId }: { ownerId?: string }) {
    const navigate = useRouter();
    const [businessName, setBusinessName] = useState("");
    const [supportEmail, setSupportEmail] = useState("");
    const [knowledge, setKnowledge] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [canEmbed, setCanEmbed] = useState(false);
    const [emailError, setEmailError] = useState("");

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSave = async () => {
        // Validate email format
        if (!validateEmail(supportEmail)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        setEmailError("");
        setLoading(true);
        try {
            await axios.post("/api/settings", {
                ownerId,
                businessName,
                supportEmail,
                knowledge,
            });

            setLoading(false);
            setSaved(true);
            setCanEmbed(true);

            setTimeout(() => {
                setSaved(false);
            }, 3000);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleGetDetails = async () => {
            try {
                const result = await axios.get(`/api/settings/get-settings?ownerId=${ownerId}`);

                setBusinessName(result.data.businessName);
                setSupportEmail(result.data.supportEmail);
                setKnowledge(result.data.knowledge);

                if (
                    result.data.businessName &&
                    result.data.supportEmail &&
                    result.data.knowledge
                ) {
                    setCanEmbed(true);
                }
            } catch (error) {
                console.log(error);
            }
        };

        handleGetDetails();
    }, [ownerId, navigate]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <motion.nav
                initial={{ y: -70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 w-full z-50"
            >
                <div className="relative backdrop-blur-2xl bg-background/30 border-b border-border shadow-xl">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[400px] h-[120px] bg-primary/10 blur-[120px] rounded-full" />

                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        {/* Left */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 cursor-pointer group relative"
                            onClick={() => navigate.push("/")}
                        >
                            <Image src='/globe.svg' alt="logo" height={36} width={36} />

                            <p className="text-lg font-semibold text-foreground tracking-wide">
                                Bot<span className="text-primary">Weave</span>
                            </p>

                            <div
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px]
                                bg-gradient-to-r from-transparent via-primary to-transparent
                                group-hover:w-3/4 transition-all duration-500"
                            />
                        </motion.div>

                        {/* Right */}
                        <motion.button
                            whileHover={canEmbed ? { y: -1.5 } : {}}
                            whileTap={canEmbed ? { scale: 0.97 } : {}}
                            disabled={!canEmbed}
                            onClick={() => canEmbed && navigate.push("/embed")}
                            className={`group relative px-7 py-2.5 rounded-xl backdrop-blur-xl border font-semibold tracking-wide shadow-lg overflow-hidden transition-all duration-300 ${
                                canEmbed
                                    ? "bg-card border-border text-foreground cursor-pointer hover:border-primary/30"
                                    : "bg-muted border-border/50 text-muted-foreground cursor-not-allowed"
                            }`}
                        >
                            <span
                                className="absolute inset-0 opacity-0 group-hover:opacity-100
                                bg-gradient-to-b from-primary/10 to-transparent
                                transition duration-300"
                            />

                            <span
                                className="absolute bottom-0 left-1/2 -translate-x-1/2
                                w-0 h-[2px]
                                bg-gradient-to-r from-transparent via-primary/40 to-transparent
                                group-hover:w-3/4 transition-all duration-500"
                            />

                            <span className="relative z-10">Embed AI Chat</span>
                        </motion.button>
                    </div>

                    <div
                        className="absolute bottom-0 inset-x-0 h-[1px]
                        bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                    />
                </div>
            </motion.nav>

            <div className="relative flex justify-center px-4 py-24 mt-6">
                <div
                    className="absolute -top-28 w-[800px] h-[380px]
                    bg-gradient-to-r from-primary/10 via-amber-300/10 to-primary/10
                    blur-[200px] rounded-full pointer-events-none"
                />

                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full max-w-6xl rounded-[30px] border border-border bg-card textured shadow-2xl overflow-hidden text-foreground"
                >
                    {/* Top */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-background/50 backdrop-blur-xl">
                        <div className="flex gap-2">
                            <span className="w-3 h-3 bg-red-500/80 rounded-full" />
                            <span className="w-3 h-3 bg-yellow-500/80 rounded-full" />
                            <span className="w-3 h-3 bg-emerald-500/80 rounded-full" />
                        </div>

                        <span className="text-[11px] tracking-[0.35em] text-muted-foreground font-semibold">
                            AI CONTROL CENTER
                        </span>

                        <span className="px-3 py-[3px] text-[10px] gold-border rounded-md font-semibold tracking-widest">
                            ACTIVE
                        </span>
                    </div>

                    {/* Content */}
                    <div className="grid md:grid-cols-2 gap-14 p-12 max-md:p-7">
                        {/* Left Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="space-y-6"
                        >
                            <h1 className="text-4xl font-semibold leading-tight gold-text">
                                Configure Your{" "}
                                <span className="bg-gradient-to-r from-foreground via-secondary-foreground to-muted-foreground bg-clip-text text-transparent">
                                    AI Assistant
                                </span>
                            </h1>

                            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                                Control how your chatbot behaves across every website. Define
                                identity, support details, and knowledge so responses stay
                                accurate and on-brand.
                            </p>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>• Brand tone customization</p>
                                <p>• Faster automated responses</p>
                                <p>• Centralized AI control</p>
                            </div>

                            <div className="mt-6 px-5 py-4 rounded-xl bg-secondary border border-border text-muted-foreground text-xs">
                                Changes apply instantly to all embedded chatbots.
                            </div>
                        </motion.div>

                        {/* Right Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="space-y-9"
                        >
                            {/* Business Details */}
                            <div>
                                <h3 className="text-[11px] tracking-[0.3em] mb-5 gold-text font-semibold">
                                    BUSINESS DETAILS
                                </h3>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Business Name"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="w-full bg-input border border-border rounded-xl px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition"
                                    />

                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Support Email"
                                            value={supportEmail}
                                            onChange={(e) => {
                                                setSupportEmail(e.target.value);
                                                if (emailError) setEmailError("");
                                            }}
                                            className={`w-full bg-input border rounded-xl px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 outline-none transition ${
                                                emailError
                                                    ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/10"
                                                    : "border-border focus:border-primary/40 focus:ring-primary/10"
                                            }`}
                                        />
                                        {emailError && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {emailError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Knowledge Base */}
                            <div>
                                <h3 className="text-[11px] tracking-[0.3em] mb-5 gold-text font-semibold">
                                    KNOWLEDGE BASE
                                </h3>

                                <textarea
                                    value={knowledge}
                                    onChange={(e) => setKnowledge(e.target.value)}
                                    placeholder="Refund policy, delivery time, FAQs..."
                                    className="w-full h-36 resize-none bg-input border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-wrap items-center gap-5">
                                <motion.button
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    disabled={loading}
                                    onClick={handleSave}
                                    className={`group relative px-9 py-3.5 rounded-xl backdrop-blur-xl border font-semibold text-sm tracking-wide shadow-lg overflow-hidden transition cursor-pointer ${
                                        loading
                                            ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                                            : "bg-secondary border-border text-foreground hover:border-primary/30"
                                    }`}
                                >
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-b from-primary/15 to-transparent transition duration-300" />

                                    <span className="relative z-10">
                                        {loading ? "Saving..." : "Apply Changes"}
                                    </span>
                                </motion.button>

                                {saved && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-emerald-400 text-xs tracking-widest"
                                    >
                                        ✓ UPDATED
                                    </motion.span>
                                )}

                                {canEmbed && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -1, scale: 1.015 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate.push("/embed")}
                                        className="group relative px-9 py-3.5 rounded-xl font-semibold text-sm tracking-wide text-foreground bg-card border border-border shadow-lg overflow-hidden transition cursor-pointer"
                                    >
                                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-b from-primary/10 to-transparent transition duration-300" />

                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent group-hover:w-3/4 transition-all duration-500" />

                                        <span className="relative z-10">Embed Code →</span>
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </motion.div>
            </div>
        </div>
    );
}

export default DashboardHome;
