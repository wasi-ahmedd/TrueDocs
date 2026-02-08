
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, Lock, FileKey, Wallet } from "lucide-react";

export default function Landing() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden selection:bg-emerald-500/30">

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <Shield className="w-6 h-6 text-emerald-500" />
                    <span className="bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                        GovtVault
                    </span>
                </div>
                <Link href="/auth">
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                        Sign In
                    </Button>
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-[-80px]">

                {/* Shining Cryptocurrency Highlight */}


                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
                >
                    <Lock className="w-3 h-3" />
                    <span>Military-Grade AES-256 Encryption</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
                >
                    Your Documents,<br />
                    For Your Eyes Only.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
                >
                    Zero-knowledge architecture means we can't see your data even if we wanted to.
                    Your files are encrypted on your device before they ever touch our servers.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col items-center gap-4 mb-20"
                >
                    <Link href="/auth">
                        <Button size="lg" className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-105">
                            Enter Vault
                        </Button>
                    </Link>

                    <a
                        href="#highlights"
                        className="text-sm md:text-base text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('highlights')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Store <span className="font-bold text-yellow-500">CRYPTOCURRENCY</span> Seed Phrases Securely & Other Govt Cards
                        <span className="group-hover:translate-y-1 transition-transform duration-300">↓</span>
                    </a>
                </motion.div>

                {/* Feature Grid - Now Top of Features */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 md:mb-32 text-left w-full max-w-5xl mx-auto"
                >
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Zero Knowledge</h3>
                        <p className="text-slate-400 text-sm">We don't know your password. If you lose it, your data is gone. That's true security.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                            <FileKey className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Client-Side Encryption</h3>
                        <p className="text-slate-400 text-sm">Data is locked with your key *before* upload. Our servers only see nonsense.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 text-orange-400">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Backdoors</h3>
                        <p className="text-slate-400 text-sm">Our open architecture proves there are no secret keys or backdoors for anyone.</p>
                    </div>
                </motion.div>

                {/* Feature Highlight Section - Below Grid */}
                <div id="highlights" className="w-full max-w-5xl mx-auto space-y-8 mb-24 scroll-mt-32">

                    {/* Govt Cards Feature */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full p-1 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20"
                    >
                        <div className="bg-slate-950/90 rounded-[22px] p-8 md:p-10 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]">
                                <Shield className="w-10 h-10 text-blue-400" />
                            </div>

                            <div className="space-y-3 flex-grow">
                                <h2 className="text-2xl md:text-3xl font-bold text-white">
                                    Organize <span className="text-blue-400">Government IDs</span>
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Keep all your essential documents accessible and secure.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                                    {["Aadhaar Card", "PAN Card", "Voter ID", "Driving License", "Passport"].map((dl) => (
                                        <span key={dl} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                                            {dl}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Crypto Feature Highlight */}
                    <motion.div
                        id="crypto"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full p-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-yellow-500/20 to-emerald-500/20 scroll-mt-24"
                    >
                        <div className="bg-slate-950/90 rounded-[22px] p-8 md:p-10 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]">
                                <Wallet className="w-10 h-10 text-yellow-500" />
                            </div>

                            <div className="space-y-3 flex-grow">
                                <h2 className="text-2xl md:text-3xl font-bold text-white">
                                    Crypto <span className="text-yellow-500">Seed Vault</span>
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Securely backup your 12/24-word recovery phrases.
                                    Offline-ready & Zero-Knowledge.
                                </p>
                            </div>

                            <div className="md:ml-auto">
                                <Link href="/auth">
                                    <Button size="lg" variant="outline" className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400">
                                        Secure Wallet
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>


            </main>
        </div>
    );
}
