"use client";
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { RiErrorWarningLine } from "react-icons/ri";
import { auth } from "../../../firebase/firebase";

const ForgotPassword = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const [email, setEmail] = useState<string>("");
  const [isClient, setIsClient] = useState<boolean>(false);
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [step, setStep] = useState<"forgotpassword" | "sendtoemail">(
    "forgotpassword"
  );
  const [isResendDisable, setIsResendDisable] = useState<boolean>(true);
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      router.push("/home");
    }
  }, [router]);

  useEffect(() => {
    if (step === "sendtoemail" && isResendDisable) {
      const countdown = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setIsResendDisable(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [step, isResendDisable]);

  if (!isClient) return null;

  const handleEmailBlur = () => setEmailTouched(true);
  const isEmailValid =
    email && /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid) {
      console.log("Please enter a valid email address.");
      return;
    }

    try {
      console.log("Checking sign-in methods for email:", email);

      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      console.log("Sign-in methods for email:", signInMethods);

      // Gửi yêu cầu đặt lại mật khẩu
      await sendPasswordResetEmail(auth, email)
        .then(() => {
          console.log("Password reset email sent successfully.");
          setStep("sendtoemail");
        })
        .catch((error) => {
          console.error("Error sending reset email:", error);
        });
    } catch (error) {
      console.error("Error during password reset:", error);
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsResendDisable(true);
      setResendCountdown(60);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending reset email:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-100 via-purple-100 to-purple-200">
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4">
        <div className="text-2xl font-bold">Gradient</div>
        <div className="relative rounded-full bg-[#F4F4F3] text-[#E0E0E0] h-8 flex text-xs">
          <button
            className={`px-4 py-2 rounded-full flex items-center justify-center transition-all duration-500 ${
              isLogin ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
            }`}
            onClick={() => router.push("/login")}
          >
            Log In
          </button>
          <button
            className={`px-4 py-2 rounded-full flex items-center justify-center transition-all duration-500 ${
              !isLogin ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
            }`}
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>

      {step === "forgotpassword" && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-medium text-center">Forgot Password</h2>

          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                type="email"
                placeholder="Enter your registered email"
                className="mt-1 block w-full px-5 py-2 border border-gray-200 rounded-full shadow-sm hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] focus:outline-none text-sm"
              />
              <div className="h-6 overflow-hidden">
                {emailTouched && !isEmailValid && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <RiErrorWarningLine />
                    Please enter a valid email address.
                  </p>
                )}
                {errorMessage && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <RiErrorWarningLine />
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isEmailValid}
              className={`relative w-full flex items-center justify-center py-3 px-4 rounded-full text-white ${
                isEmailValid
                  ? "bg-black hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900"
                  : "bg-black bg-opacity-20 cursor-not-allowed"
              }`}
            >
              Continue
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {[...Array(30)].map((_, index) => (
                  <div
                    key={index}
                    className="particle"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 1}s`,
                    }}
                  ></div>
                ))}
              </div>
            </button>
          </form>
        </div>
      )}
      {step === "sendtoemail" && (
        <div className="w-full md:max-w-md max-w-2xl bg-white rounded-2xl shadow-lg p-8 relative">
          <div className="w-full flex flex-row justify-center pt-22 pb-8 items-center">
            <HiOutlineMail style={{ height: "100", width: "100" }} />
          </div>
          <div className="text-center text-lg text-black font-normal mt-2">
            An email has been sent.
          </div>
          <div className="text-center text-sm text-[#B2B2B2] my-4">
            Please follow the instructions in the email to reset your password
          </div>

          <button
            disabled={isResendDisable}
            type="button"
            onClick={handleResendEmail}
            className={`relative w-full flex items-center justify-center py-3 px-4 rounded-full text-white ${
              !isResendDisable
                ? "bg-black hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
                : "bg-black bg-opacity-20 cursor-not-allowed"
            }`}
            // className="relative mb-2 w-full flex items-center justify-center bg-black text-white py-3 px-4 rounded-full hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
          >
            {isResendDisable
              ? `Resend Password (${resendCountdown}s)`
              : "Resend Password"}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {/* Hạt di chuyển bên trong nút */}
              {[...Array(30)].map((_, index) => (
                <div
                  key={index}
                  className="particle"
                  style={{
                    top: `${Math.random() * 100}%`, // Vị trí ngẫu nhiên dọc theo chiều cao
                    left: `${Math.random() * 100}%`, // Vị trí ngẫu nhiên ngang
                    animationDelay: `${Math.random() * 1}s`, // Thời gian trễ ngẫu nhiên cho từng hạt
                  }}
                ></div>
              ))}
            </div>
            <canvas className="w-full h-full absolute inset-0 pointer-events-none"></canvas>
          </button>
          <div className="cursor-default flex-row mt-10 text-xs text-black text-opacity-40 text-center">
            I&apos;ve reset my password.
            <a href="/login" className="underline ml-1">
              Log In
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
