import React, { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { Store, User, Phone, Lock, MapPin, ArrowRight } from "lucide-react";

interface RegisterProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    ownerName: "",
    businessName: "",
    businessType: "retail" as const,
    location: "",
    pin: "",
    confirmPin: "",
  });

  const { register, isLoading, error } = useAuthStore();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && formData.phoneNumber.length >= 9) {
      setStep(2);
    } else if (step === 2 && formData.ownerName && formData.businessName) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pin !== formData.confirmPin) {
      alert("PINs do not match");
      return;
    }
    if (formData.pin.length !== 4) {
      alert("PIN must be 4 digits");
      return;
    }

    try {
      await register({
        phoneNumber: formData.phoneNumber,
        ownerName: formData.ownerName,
        businessName: formData.businessName,
        businessType: formData.businessType,
        location: formData.location || undefined,
        preferences: {
          currency: "KES",
          language: "en",
          lowStockThreshold: 5,
          creditAlertDays: 3,
          darkMode: true,
        },
        lastLogin: new Date(),
        pinHash: formData.pin, // Will be hashed in the store
      });
      onRegisterSuccess();
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.slice(0, 9);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 bg-emerald rounded-2xl flex items-center 
            justify-center mx-auto mb-4 text-3xl font-bold text-obsidian"
          >
            P
          </div>
          <h2 className="text-2xl font-display font-bold mb-2 text-gradient">
            Create Your Account
          </h2>
          <p className="text-text-secondary">
            Step {step} of 3:{" "}
            {step === 1
              ? "Phone Number"
              : step === 2
                ? "Business Info"
                : "Security"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                i <= step ? "bg-emerald" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Form */}
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    <Phone size={16} className="inline mr-2" />
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
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="712345678"
                      className="flex-1 bg-transparent p-3 text-text-primary 
                        focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={formData.phoneNumber.length < 9}
                  className="w-full bg-emerald text-obsidian py-3 rounded-lg font-bold
                    hover:bg-emerald/90 transition-colors disabled:opacity-50 
                    disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    <User size={16} className="inline mr-2" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="e.g., Mary Wanjiku"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    <Store size={16} className="inline mr-2" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g., Mama Jane's Groceries"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                  >
                    <option value="retail">Retail / Shop</option>
                    <option value="food">Food / Restaurant</option>
                    <option value="boda">Boda Boda / Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Kamukunji Market"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-transparent border border-white/10 
                      text-text-secondary py-3 rounded-lg font-bold
                      hover:border-white/20 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!formData.ownerName || !formData.businessName}
                    className="flex-1 bg-emerald text-obsidian py-3 rounded-lg font-bold
                      hover:bg-emerald/90 transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Create PIN (4 digits)
                  </label>
                  <input
                    type="password"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    maxLength={4}
                    placeholder="****"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-4
                      text-text-primary text-center text-2xl tracking-widest
                      focus:outline-none focus:border-emerald"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    name="confirmPin"
                    value={formData.confirmPin}
                    onChange={handleChange}
                    maxLength={4}
                    placeholder="****"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-4
                      text-text-primary text-center text-2xl tracking-widest
                      focus:outline-none focus:border-emerald"
                  />
                </div>

                {error && (
                  <p className="text-rust text-sm text-center">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-transparent border border-white/10 
                      text-text-secondary py-3 rounded-lg font-bold
                      hover:border-white/20 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={
                      formData.pin.length < 4 ||
                      formData.pin !== formData.confirmPin ||
                      isLoading
                    }
                    className="flex-1 bg-emerald text-obsidian py-3 rounded-lg font-bold
                      hover:bg-emerald/90 transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </form>

          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-text-secondary text-sm">
                Already have an account?{" "}
                <button
                  onClick={onNavigateToLogin}
                  className="text-emerald hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
