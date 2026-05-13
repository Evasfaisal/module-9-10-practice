import React, { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../Firebase/firebase.conf";
import "./auth.css";

export default function Signup() {
    const navigate = useNavigate();
    const googleProvider = new GoogleAuthProvider();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function getSignupErrorMessage(code) {
        if (code === "auth/email-already-in-use") {
            return "This email is already used";
        }
        if (code === "auth/invalid-email") {
            return "Please enter a valid email";
        }
        if (code === "auth/weak-password") {
            return "Password should be at least 6 characters";
        }
        return "Sign up failed. Please try again";
    }

    function getGoogleErrorMessage(code) {
        if (code === "auth/popup-closed-by-user") {
            return "Google popup was closed before sign up";
        }
        if (code === "auth/cancelled-popup-request") {
            return "Another popup request is already running";
        }
        return "Google sign up failed. Please try again";
    }

    function onChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.password || !form.confirm) {
            setError("All fields are required");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            await updateProfile(userCredential.user, { displayName: form.name });
            navigate("/");
        } catch (firebaseError) {
            setError(getSignupErrorMessage(firebaseError.code));
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignup() {
        try {
            setError("");
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
            navigate("/");
        } catch (firebaseError) {
            setError(getGoogleErrorMessage(firebaseError.code));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={onSubmit} aria-label="signup-form">
                <h2 className="auth-title">Create account</h2>

                {error && <div className="auth-error">{error}</div>}

                <label className="auth-label">Name
                    <input name="name" value={form.name} onChange={onChange} className="auth-input" placeholder="Your name" />
                </label>

                <label className="auth-label">Email
                    <input name="email" type="email" value={form.email} onChange={onChange} className="auth-input" placeholder="you@example.com" />
                </label>

                <label className="auth-label">Password
                    <input name="password" type="password" value={form.password} onChange={onChange} className="auth-input" placeholder="••••••••" />
                </label>

                <label className="auth-label">Confirm password
                    <input name="confirm" type="password" value={form.confirm} onChange={onChange} className="auth-input" placeholder="Repeat password" />
                </label>

                <button type="submit" className="auth-button" disabled={loading}>{loading ? "Creating account..." : "Sign up"}</button>

                <div className="auth-divider"><span>or</span></div>

                <button type="button" className="auth-google-button" onClick={handleGoogleSignup} disabled={loading}>
                    <svg className="google-icon" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                        <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0795-1.7959 2.7181v2.2586h2.9086c1.7023-1.5677 2.6837-3.8773 2.6837-6.6176z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9563-2.1773l-2.9086-2.2586c-.8073.5414-1.8409.8618-3.0477.8618-2.3441 0-4.3282-1.5832-5.0373-3.7105H.9577v2.3318C2.4382 15.9891 5.4818 18 9 18z" />
                        <path fill="#FBBC05" d="M3.9627 10.7155C3.7827 10.1741 3.6818 9.5964 3.6818 9s.1009-1.1741.2809-1.7155V4.9527H.9577C.3477 6.1677 0 7.5409 0 9s.3477 2.8323.9577 4.0473l3.005-2.3318z" />
                        <path fill="#EA4335" d="M9 3.573c1.3214 0 2.5082.4541 3.4418 1.3459l2.5814-2.5814C13.4632.8918 11.4264 0 9 0 5.4818 0 2.4382 2.0109.9577 4.9527l3.005 2.3318C4.6718 5.1564 6.6559 3.573 9 3.573z" />
                    </svg>
                    <span>{loading ? "Please wait..." : "Sign up with Google"}</span>
                </button>

                <div className="auth-footer">Already have an account? <Link to="/signin">Sign in</Link></div>
            </form>
        </div>
    );
}
