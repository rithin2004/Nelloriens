import { useEffect, useState } from "react";
import { Mail, MapPin, Send, Phone } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../components/Footer";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import TopHeader from "../components/TopHeader";
import useTranslation from "../hooks/useTranslation";
import { resetContactForm, submitContactForm } from "../state/slices/contactSlice";

const inputClass = "w-full py-3 px-4 border-2 border-[#e9ecef] rounded-[10px] text-base text-[#212529] transition-all duration-300 bg-[#f8f9fa] font-[inherit] focus:border-[#0d6efd] focus:outline-none focus:bg-white focus:shadow-[0_0_0_4px_rgba(13,110,253,0.1)]";

const ContactUs = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { data: footerData } = useSelector((state) => state.footer);

    const siteEmail = footerData?.email || "contact@nelloriens.in";
    const sitePhone = footerData?.phones?.[0] || "+91 8341540001";
    const siteLocation = footerData?.location || "Nellore, Andhra Pradesh, India";

    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

    const { loading, success, error } = useSelector((state) => state.contact || {
        loading: false,
        success: false,
        error: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(submitContactForm(formData));
    };

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                dispatch(resetContactForm());
                setFormData({ name: "", email: "", subject: "", message: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, dispatch]);

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <TopHeader />
            <MainHeader />
            <Navbar />

            <main
                className="flex-1 py-16 relative overflow-hidden max-sm:py-8"
                style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
            >
                {/* Background decorations replacing ::before / ::after */}
                <div className="absolute -top-[10%] -left-[10%] w-1/2 h-1/2 rounded-full z-0 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(13,110,253,0.1) 0%, rgba(255,255,255,0) 70%)' }} />
                <div className="absolute -bottom-[10%] -right-[10%] w-1/2 h-1/2 rounded-full z-0 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(13,202,240,0.1) 0%, rgba(255,255,255,0) 70%)' }} />

                <div className="relative z-1 max-w-300 mx-auto px-5">
                    <div
                        className="text-center mb-12"
                        style={{ animation: 'fadeInDown 0.8s ease-out' }}
                    >
                        <h1 className="text-[2.5rem] font-bold text-[#1a2332] mb-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)] max-md:text-[2rem] max-sm:text-[1.8rem]">
                            {t("Contact Us") || "Contact Us"}
                        </h1>
                        <p className="text-[1.1rem] text-[#6c757d] max-w-150 mx-auto">
                            Have questions or suggestions? We'd love to hear from you.
                            Reach out to us using the form below or via our contact details.
                        </p>
                    </div>

                    <div
                        className="flex flex-wrap gap-8 items-stretch max-md:flex-col"
                        style={{ animation: 'fadeInUp 1s ease-out forwards', animationDelay: '0.3s', opacity: 0 }}
                    >
                        {/* Contact Info Card */}
                        <div
                            className="flex-1 min-w-75 rounded-[20px] p-12 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-white/50 transition-all duration-300 hover:-translate-y-1.25 hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] max-sm:p-6 max-sm:min-w-full"
                            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                        >
                            {[
                                { icon: <MapPin />, label: t("Our Location") || "Our Location", value: siteLocation },
                                { icon: <Mail />, label: t("Email Us") || "Email Us", value: siteEmail },
                                { icon: <Phone />, label: t("Call Us") || "Call Us", value: sitePhone },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="flex items-start mb-8 max-sm:mb-6">
                                    <div
                                        className="w-12.5 h-12.5 rounded-xl flex items-center justify-center mr-6 text-white text-2xl shadow-[0_5px_15px_rgba(13,110,253,0.3)] shrink-0 max-sm:w-10 max-sm:h-10 max-sm:text-[1.2rem] max-sm:mr-4"
                                        style={{ background: 'linear-gradient(135deg, #0d6efd, #0dcaf0)' }}
                                    >
                                        {icon}
                                    </div>
                                    <div>
                                        <h4 className="text-[1.2rem] font-semibold text-[#1a2332] m-0 mb-2">{label}</h4>
                                        <p className="text-[#6c757d] m-0 text-base">{value}</p>
                                    </div>
                                </div>
                            ))}

                            <div style={{ marginTop: '2rem', borderRadius: '15px', overflow: 'hidden', height: '200px', background: '#e9ecef' }}>
                                <iframe
                                    title="Nellore Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61776.54922240974!2d79.9573983296836!3d14.449371900000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4c8cca0e958771%3A0xd3036c2025161f55!2sNellore%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1709282342834!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>

                        {/* Contact Form Card */}
                        <div className="flex-[1.5] min-w-87.5 bg-white rounded-[20px] p-12 shadow-[0_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden max-sm:p-6 max-sm:min-w-full">
                            {/* Top gradient bar replacing ::before */}
                            <div className="absolute top-0 left-0 w-full h-1.25" style={{ background: 'linear-gradient(90deg, #0d6efd, #0dcaf0)' }} />

                            <form onSubmit={handleSubmit}>
                                {[
                                    { id: "name",    label: "Full Name",       type: "text",  placeholder: "Enter your name",             autoComplete: "name"  },
                                    { id: "email",   label: "Email Address",   type: "email", placeholder: "Enter your email",            autoComplete: "email" },
                                    { id: "subject", label: "Subject",         type: "text",  placeholder: "What is this regarding?",     autoComplete: "off"   },
                                ].map(({ id, label, type, placeholder, autoComplete }) => (
                                    <div key={id} className="mb-6">
                                        <label className="block font-medium text-[#2a3441] mb-2" htmlFor={id}>{label}</label>
                                        <input
                                            type={type}
                                            id={id}
                                            name={id}
                                            autoComplete={autoComplete}
                                            className={inputClass}
                                            value={formData[id]}
                                            onChange={handleChange}
                                            placeholder={placeholder}
                                            required
                                        />
                                    </div>
                                ))}

                                <div className="mb-6">
                                    <label className="block font-medium text-[#2a3441] mb-2" htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        autoComplete="off"
                                        className={`${inputClass} resize-y min-h-37.5`}
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Type your message here..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="text-white border-none py-3.5 px-8 text-[1.1rem] font-semibold rounded-full cursor-pointer transition-all duration-300 w-full flex items-center justify-center gap-2.5 shadow-[0_10px_20px_rgba(13,110,253,0.2)] hover:-translate-y-0.5 hover:shadow-[0_15px_25px_rgba(13,110,253,0.3)] active:translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed max-sm:py-3 max-sm:px-6 max-sm:text-base"
                                    style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)' }}
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : (<>Send Message <Send /></>)}
                                </button>

                                {success && (
                                    <div className="mt-6 p-4 rounded-[10px] font-medium text-center bg-[#d1e7dd] text-[#0f5132] border border-[#badbcc]">
                                        Message sent successfully! We will get back to you soon.
                                    </div>
                                )}
                                {error && (
                                    <div className="mt-6 p-4 rounded-[10px] font-medium text-center bg-[#f8d7da] text-[#842029] border border-[#f5c2c7]">
                                        {error}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactUs;
