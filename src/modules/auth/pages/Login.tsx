import React, { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { Shield, Phone, Lock, ArrowRight } from "lucide-react";

interface LoginProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"phone" | "pin">("phone");

  const { login, isLoading, error } = useAuthStore();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 9) {
      setStep("pin");
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4) {
      const success = await login(phone, pin);
      if (success) {
        onLoginSuccess();
      }
    }
  };

  const formatPhone = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    // Limit to 9 digits
    return digits.slice(0, 9);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald/20 blur-2xl rounded-full"></div>
            <div
              className="relative w-20 h-20 bg-emerald rounded-2xl flex items-center 
              justify-center mx-auto mb-4 text-4xl font-bold text-obsidian
              transform -rotate-3 hover:rotate-0 transition-transform duration-300"
            >
              P
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold mb-2 text-gradient">
            Karibu PesaLocal
          </h2>
          <p className="text-text-secondary">
            {step === "phone"
              ? "Enter your phone number to continue"
              : "Enter your PIN to access your vault"}
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 bg-emerald/5 border border-emerald/10 
            rounded-full px-4 py-2"
          >
            <Shield size={16} className="text-emerald" />
            <span className="text-xs text-emerald font-medium">
              End-to-End Encrypted
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6">
          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit}>
              <div className="mb-6">
                <label className="block text-text-secondary text-sm mb-2">
                  Phone Number
                </label>
                <div
                  className="flex items-center bg-black/20 rounded-lg border border-white/5
                  focus-within:border-emerald transition-colors"
                >
                  <span className="px-3 text-text-secondary border-r border-white/10">
                    +254
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="712345678"
                    className="flex-1 bg-transparent p-3 text-text-primary 
                      focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  We'll never share your number. All data stays on your device.
                </p>
              </div>

              <button
                type="submit"
                disabled={phone.length < 9}
                className="w-full bg-emerald text-obsidian py-3 rounded-lg font-bold
                  hover:bg-emerald/90 transition-colors disabled:opacity-50 
                  disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit}>
              <div className="mb-6">
                <label className="block text-text-secondary text-sm mb-2">
                  Enter Your PIN
                </label>
                <div className="flex justify-center gap-3 mb-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full transition-all ${
                        pin.length > i ? "bg-emerald scale-110" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setPin(digits.slice(0, 4));
                  }}
                  maxLength={4}
                  className="w-full bg-black/20 border border-white/5 rounded-lg p-4 
                    text-text-primary text-center text-2xl tracking-widest
                    focus:outline-none focus:border-emerald"
                  autoFocus
                />
                {error && (
                  <p className="text-rust text-sm mt-2 text-center">{error}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setPin("");
                  }}
                  className="flex-1 bg-transparent border border-white/10 
                    text-text-secondary py-3 rounded-lg font-bold
                    hover:border-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={pin.length < 4 || isLoading}
                  className="flex-1 bg-emerald text-obsidian py-3 rounded-lg font-bold
                    hover:bg-emerald/90 transition-colors disabled:opacity-50 
                    disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Login"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              New to PesaLocal?{" "}
              <button
                onClick={onNavigateToRegister}
                className="text-emerald hover:underline font-medium"
              >
                Create account
              </button>
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-xs text-text-secondary mt-6">
          🔒 Your data never leaves your device • 100% offline • Open source
        </p>
      </div>
    </div>
  );
};
