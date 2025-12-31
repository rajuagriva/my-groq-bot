"use client";

import React, { useState } from 'react';

export default function LoginModal() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Dummy login handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt:", { email, password });
        alert("This is a UI demo. Login logic to be implemented.");
    };

    return (
        <>
            <style jsx global>{`
        .backdrop-blur-custom {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>

            {/* Background Decoration (Optional, to add depth to the 'app' behind the modal) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-[#9EC6F3] blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-primary/30 blur-[100px]"></div>
            </div>

            {/* Main Content Wrapper (Simulating the underlying app content, blurred out) */}
            <div aria-hidden="true" className="absolute inset-0 z-0 flex flex-col items-center pt-20 px-6 opacity-30 blur-sm pointer-events-none">
                <div className="w-full h-40 bg-white/40 rounded-xl mb-4"></div>
                <div className="w-full h-24 bg-white/40 rounded-xl mb-4"></div>
                <div className="w-full h-64 bg-white/40 rounded-xl"></div>
            </div>

            {/* Modal Overlay */}
            <div className="relative z-10 w-full max-w-sm px-4">
                {/* Modal Card */}
                <div className="bg-white dark:bg-[#2C241B] rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                    {/* Top App Bar / Header */}
                    <div className="flex items-center p-5 pb-2 justify-between">
                        <h2 className="text-text-primary dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1">Welcome Back</h2>
                        <div className="flex items-center justify-end">
                            <button
                                className="flex cursor-pointer items-center justify-center rounded-full w-8 h-8 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-primary dark:text-white"
                                onClick={() => console.log("Close modal clicked")}
                            >
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <form className="flex flex-col gap-1 p-5 pt-2" onSubmit={handleLogin}>
                        {/* Email TextField */}
                        <div className="flex flex-col gap-2 mb-3">
                            <label className="flex flex-col w-full">
                                <p className="text-text-primary dark:text-gray-200 text-sm font-medium leading-normal pb-2 ml-1">Email Address</p>
                                <input
                                    className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary dark:text-white border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#382E24] focus:border-primary focus:ring-1 focus:ring-primary h-12 placeholder:text-gray-400 p-4 text-base font-normal leading-normal transition-all"
                                    placeholder="name@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </label>
                        </div>
                        {/* Password TextField */}
                        <div className="flex flex-col gap-2">
                            <label className="flex flex-col w-full">
                                <p className="text-text-primary dark:text-gray-200 text-sm font-medium leading-normal pb-2 ml-1">Password</p>
                                <div className="relative flex w-full items-stretch rounded-lg">
                                    <input
                                        className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary dark:text-white border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#382E24] focus:border-primary focus:ring-1 focus:ring-primary h-12 placeholder:text-gray-400 p-4 pr-12 text-base font-normal leading-normal transition-all"
                                        placeholder="Enter your password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div className="absolute right-0 top-0 h-full flex items-center pr-3 cursor-pointer text-gray-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                        {/* MetaText (Forgot Password) */}
                        <div className="flex justify-end pt-2 pb-4">
                            <a className="text-primary hover:text-primary/80 text-sm font-medium leading-normal transition-colors" href="#">Forgot Password?</a>
                        </div>
                        {/* SingleButton (Login) */}
                        <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white text-base font-bold leading-normal tracking-[0.015em] shadow-md shadow-primary/20 transition-all">
                            <span className="truncate">Log in</span>
                        </button>
                        {/* Social Login Divider */}
                        <div className="relative flex py-6 items-center">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Or continue with</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        {/* Social Buttons (Using SingleButton logic but secondary style) */}
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-[#382E24] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#44382c] transition-colors"
                            >
                                {/* Google G Icon Placeholder */}
                                <div className="w-5 h-5 relative flex items-center justify-center">
                                    <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" fill="#4285F4"></path><path d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" fill="#34A853"></path><path d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" fill="#FBBC05"></path><path d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" fill="#EA4335"></path></g></svg>
                                </div>
                                <span className="text-text-primary dark:text-white text-sm font-semibold">Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-[#382E24] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#44382c] transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl text-text-primary dark:text-white">ios</span>
                                <span className="text-text-primary dark:text-white text-sm font-semibold">Apple</span>
                            </button>
                        </div>
                    </form>
                    {/* Footer Sign Up Link */}
                    <div className="px-5 pb-6 text-center">
                        <p className="text-text-primary dark:text-gray-300 text-sm">
                            Don't have an account?
                            <a className="text-primary font-bold hover:underline ml-1" href="#">Sign up</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
