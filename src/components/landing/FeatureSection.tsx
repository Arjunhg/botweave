import { motion } from "motion/react";

export default function FeatureSection() {

      const features = [
            {
                title: "Easy Integration",
                description: "Integrate our AI chatbot into your website with a single script, ensuring a seamless and user-friendly experience for your customers.",
                icon: "⚡",
            },
            {
                title: "Admin Controlled",
                description: "Control the AI chatbot's behavior and responses through our admin dashboard, allowing you to tailor it to your specific needs.",
                icon: "🛡️",
            },
            {
                title: "Instant Customer Support",
                description: "Get instant, accurate responses to your customers' questions, ensuring a smooth and efficient customer support experience.",
                icon: "💬",
            },
        ];
    return (
        <section
            id="feature"
            className="relative py-28 px-6 border-t border-border overflow-hidden"
        >
            <div className="absolute top-24 left-1/3 w-96 h-96 bg-primary/5 blur-[160px] rounded-full" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-orange-500/5 blur-[160px] rounded-full" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center leading-tight"
                >
                    <span className="bg-gradient-to-r from-primary via-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Why Choose Our AI Chatbot?
                    </span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto"
                >
                    Everything you need to deliver world-class customer support, woven right into your site.
                </motion.p>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.7 }}
                            whileHover={{ y: -6 }}
                            className="group relative rounded-2xl p-8 bg-card textured border border-border shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-3/4 transition-all duration-500" />

                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-t from-primary/8 via-transparent to-transparent" />

                            <div className="text-3xl mb-4 relative z-10">{feature.icon}</div>

                            <h3 className="text-lg font-semibold text-card-foreground relative z-10">
                                {feature.title}
                            </h3>
                            <div className="w-16 h-[2px] mt-2 mb-4 bg-gradient-to-r from-primary/50 to-transparent" />

                            <p className="mt-3 text-muted-foreground text-sm leading-relaxed relative z-10">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
