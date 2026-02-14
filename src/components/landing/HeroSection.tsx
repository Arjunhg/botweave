"use client";
import { AnimatePresence, motion } from "motion/react"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FeatureSection from "./FeatureSection";
import axios from "axios";
import toast from "react-hot-toast";

export default function HeroSection({ email } : { email?: string }) {

    const handleLogin = () => {
        window.location.href = "/api/auth/signin";
    }

    // display name and make first leter uppercase
    const nameToDisplay = email ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) : "User";

    const [open, setOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // when click outside of dropdown, close it

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(dropdownRef.current && !dropdownRef.current.contains(e.target as Node)){
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const navigate = useRouter();

    const handleLogout = async () => {
        try {
            await axios.get('/api/auth/logout');
            navigate.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    const searchParams = useSearchParams();
    useEffect(() => {
        if(searchParams.get("error") === "unauthenticated"){
            toast.error("Login to access the dashboard", {
                style: {
                    borderRadius: "10px",
                    background: "#333",
                    color: "#fff",
                }
            });
            navigate.push("/");
        }
    }, [searchParams]);
    

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Nav */}
            <motion.div
                className="fixed top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border"
                initial={{ y:-50 }}
                animate={{ y:0 }}
                transition={{ duration:0.7, ease:"easeOut" }}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="text-xl font-semibold tracking-tight">
                        Bot<span className="text-primary">Weave</span>
                    </div>
                    {email ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-md cursor-pointer"
                                onClick={() => setOpen(!open)}
                            >
                                {nameToDisplay.charAt(0)}
                            </button>
                            {/* DropDown */}
                            <AnimatePresence>
                                {open && (
                                    <motion.div
                                        className="absolute right-0 mt-3 w-44 bg-card textured rounded-xl shadow-xl border border-border overflow-hidden"
                                        initial={{opacity:0, y:-10}}
                                        animate={{opacity:1, y:0}}
                                        exit={{opacity:0, y:-10}}
                                    >
                                        <button className="w-full text-left px-4 py-3 text-sm text-card-foreground hover:bg-secondary transition-colors cursor-pointer"onClick={() => navigate.push('/dashboard')}>Dashboard</button>
                                        <button className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-secondary transition-colors cursor-pointer" onClick={handleLogout}>Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md hover:shadow-lg transition cursor-pointer"
                            onClick={handleLogin}
                        >
                            Login
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Hero Content */}
            <section className="pt-36 pb-28 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    {/* Left */}
                    <motion.div
                        initial={{opacity: 0, y: 40}}
                        animate={{opacity:1, y: 0}}
                        transition={{duration:0.8, ease:"easeOut"}}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6 tracking-wide"
                        >
                            AI-Powered Customer Support
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                            Weave your{" "}
                            <span className="bg-gradient-to-r from-primary via-amber-400 to-orange-400 bg-clip-text text-transparent">
                                AI Bots
                            </span>{" "}
                            effortlessly into your website
                        </h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.7 }}
                            className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
                        >
                            Experience the power of seamless AI bot integration with BotWeave. Our platform allows you to effortlessly embed intelligent bots into your website, enhancing user engagement and providing personalized interactions.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.7 }}
                            className="mt-10 flex gap-4"
                        >
                            {email ? (
                                <motion.button
                                    whileHover={{ y: -2, boxShadow: "0 20px 40px rgba(212, 168, 83, 0.3)" }}
                                    whileTap={{ scale: 0.96 }}
                                    className="group relative px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold tracking-wide shadow-lg overflow-hidden cursor-pointer"
                                    onClick={() => navigate.push("/dashboard")}
                                >
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-500" />
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent group-hover:w-3/4 transition-all duration-500" />
                                    <span className="relative z-10">Go To Dashboard</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ y: -2, boxShadow: "0 20px 40px rgba(212, 168, 83, 0.3)" }}
                                    whileTap={{ scale: 0.96 }}
                                    className="group relative px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold tracking-wide shadow-lg overflow-hidden cursor-pointer"
                                    onClick={handleLogin}
                                >
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-500" />
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent group-hover:w-3/4 transition-all duration-500" />
                                    <span className="relative z-10">Get Started</span>
                                </motion.button>
                            )}
                        </motion.div>
                    </motion.div>
                    {/* Right — Chat Preview Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="absolute -inset-10 bg-primary/8 blur-[140px] rounded-full" />

                        <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-primary/30 via-transparent to-primary/10 shadow-2xl">
                            <div className="relative rounded-3xl bg-card textured backdrop-blur-2xl p-7 sm:p-9 overflow-hidden border border-border">
                                <div className="flex flex-col justify-between gap-2 mb-6">
                                    <div className="text-sm px-2 py-0.5 rounded-md bg-primary/15 text-primary font-medium shadow-sm w-fit">
                                        Live Chat Preview
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="w-3 h-3 bg-red-400/80 rounded-full" />
                                        <span className="w-3 h-3 bg-yellow-400/80 rounded-full" />
                                        <span className="w-3 h-3 bg-green-400/80 rounded-full" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8, duration: 0.5 }}
                                        className="bg-primary rounded-xl px-4 py-2.5 text-sm text-primary-foreground self-end w-fit shadow-md"
                                    >
                                        Do you offer cash on delivery?
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.2, duration: 0.5 }}
                                        className="bg-secondary rounded-xl px-4 py-2.5 text-sm text-secondary-foreground self-start w-fit shadow-md"
                                    >
                                        Yes, we offer cash on delivery.
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.6, duration: 0.4 }}
                                        className="flex gap-1 self-start"
                                    >
                                        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:.15s]" />
                                        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:.3s]" />
                                    </motion.div>
                                </div>

                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent blur-sm" />
                            </div>
                        </div>

                        <motion.div
                            animate={{ y: [0, -16, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -bottom-10 -right-6 w-18 h-18 rounded-full bg-gradient-to-br from-card to-background text-foreground flex items-center justify-center shadow-2xl text-2xl border border-border"
                        >
                            🗨️
                        </motion.div>
                    </motion.div>
                </div>
            </section>
            <FeatureSection/>
            <footer className="py-10 text-center text-sm text-muted-foreground border-t border-border">
                &copy; {new Date().getFullYear()} BotWeave. All rights reserved.
            </footer>
        </div>
    )
}