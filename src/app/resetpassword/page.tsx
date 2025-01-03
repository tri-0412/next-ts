"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { RiErrorWarningLine } from "react-icons/ri";
import {
  auth,
  reauthenticateUser,
  updateUserPassword,
} from "../../../firebase/firebase";
import { CiCircleCheck } from "react-icons/ci";
import { onAuthStateChanged, User } from "firebase/auth";

interface CustomUser extends User {
  stsTokenManager?: {
    refreshToken: string;
    accessToken: string;
    expirationTime: number;
  };
}

function ResetPassword() {
  const [isClient, setIsClient] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isPasswordVisibleOld, setIsPasswordVisibleOld] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [passwordErrorOld, setPasswordErrorOld] = useState(false);

  const [step, setStep] = useState<"resetpassword" | "congratulations">(
    "resetpassword"
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("previousPage", window.location.href);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        console.error("No user is logged in.");
        router.push("/login");
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
        setCurrentUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);
  useEffect(() => {
    if (step === "congratulations") {
      const user = auth.currentUser;
      if (user) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, [step, router]);

  const togglePasswordVisibilityOld = () =>
    setIsPasswordVisibleOld((prev) => !prev);

  const togglePasswordVisibility1 = () => setIsPasswordVisible((prev) => !prev);
  const togglePasswordVisibility2 = () =>
    setIsPasswordVisible2((prev) => !prev);

  const handlePasswordBlurOld = () => !oldPassword && setPasswordErrorOld(true);

  const handlePasswordBlur = () => !password && setPasswordError(true);
  const handlePasswordBlur2 = () =>
    (!confirmPassword || password !== confirmPassword) &&
    setConfirmPasswordError(true);

  const handleSubmitResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    console.log("Reset password initiated...");
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()]{6,20}$/;
    let hasError = false;

    setPasswordError(false);
    setConfirmPasswordError(false);
    setPasswordErrorOld(false);

    if (!passwordRegex.test(oldPassword)) {
      setPasswordErrorOld(true);
      hasError = true;
    }
    if (!passwordRegex.test(password)) {
      setPasswordError(true);
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      hasError = true;
    }

    if (hasError) return;

    try {
      const user = auth.currentUser as CustomUser;
      if (!user || !user.email) {
        console.error("No user is logged in.");
        router.push("/login");
        return;
      }

      const isReauthenticated = await reauthenticateUser(
        user.email,
        oldPassword
      );
      if (!isReauthenticated) {
        console.log("Reauthentication failed.");
        router.push("/login");
        return;
      }

      await updateUserPassword(password);
      console.log("Password updated successfully.");
      setStep("congratulations");
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  };

  if (!isClient) return null;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-100 via-purple-100 to-purple-200">
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 z-10">
        <div className="text-2xl font-bold">Gradient</div>
        <div className="relative rounded-full bg-[#F4F4F3] text-[#E0E0E0] h-8 flex text-xs font-medium">
          <button
            className="px-4 py-2 rounded-full flex items-center justify-center bg-gray-800 text-white"
            onClick={() => router.push("/login")}
          >
            Log In
          </button>
          <button
            className="px-4 py-2 rounded-full flex items-center justify-center bg-gray-100 text-black"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
      {step === "resetpassword" && (
        <div className="w-full md:max-w-md max-w-2xl bg-white rounded-2xl shadow-lg p-8 relative">
          <h2 className="text-xl font-medium text-center">
            Reset Your Password
          </h2>
          <div className="text-center text-sm text-[#B2B2B2] mt-2">
            Please choose a new password:
          </div>
          <form onSubmit={handleSubmitResetPassword} className="space-y-4 mt-6">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <input
                  onBlur={handlePasswordBlurOld}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  type={isPasswordVisibleOld ? "text" : "password"}
                  placeholder="Enter Current Password"
                  className="mt-1 block w-full px-5 py-3 border border-gray-200 rounded-full shadow-sm hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] focus:outline-none text-sm"
                />
                <span
                  onClick={togglePasswordVisibilityOld}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
                >
                  {isPasswordVisibleOld ? (
                    <IoEyeOutline />
                  ) : (
                    <IoEyeOffOutline />
                  )}
                </span>
              </div>
              <div className="h-6 md:h-8 overflow-hidden">
                {passwordErrorOld && (
                  <p className="text-[#FF5454] text-xs">
                    <RiErrorWarningLine className="inline" />
                    &nbsp;Password must be 6-20 characters long and can only
                    contain letters, numbers, and !@#$%^&*().
                  </p>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  onBlur={handlePasswordBlur}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  value={password}
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Enter Password"
                  className="mt-1 block w-full px-5 py-3 md:py-2 border border-gray-200 rounded-full shadow-sm hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] focus:outline-none text-sm"
                />
                <span
                  onClick={togglePasswordVisibility1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
                >
                  {isPasswordVisible ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </div>
              <div className="h-6 md:h-8 overflow-hidden">
                {passwordError && (
                  <p className="text-[#FF5454] text-xs">
                    <RiErrorWarningLine className="inline" />
                    &nbsp;Password must be 6-20 characters long and can only
                    contain letters, numbers, and !@#$%^&*().
                  </p>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  onBlur={handlePasswordBlur2}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError(false);
                  }}
                  type={isPasswordVisible2 ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="mt-1 block w-full px-5 py-3 md:py-2 border border-gray-200 rounded-full shadow-sm hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] focus:outline-none text-sm"
                />
                <span
                  onClick={togglePasswordVisibility2}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
                >
                  {isPasswordVisible2 ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </div>
              <div className="h-6 overflow-hidden">
                {confirmPasswordError && (
                  <p className="text-red-500 text-xs">
                    <RiErrorWarningLine className="inline" />
                    &nbsp;Passwords do not match.
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                disabled={
                  passwordError ||
                  confirmPasswordError ||
                  !password ||
                  !confirmPassword
                }
                type="submit"
                className="relative mb-2 w-full flex items-center justify-center bg-black text-white py-3 px-4 rounded-full hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
              >
                Reset Password
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
            </div>
          </form>
        </div>
      )}
      {step === "congratulations" && (
        <div className="w-full md:max-w-md max-w-2xl bg-white rounded-2xl shadow-lg p-8 relative">
          <div className="my-4">
            <div className="w-full flex flex-row justify-center items-center mt-4">
              <CiCircleCheck style={{ height: "100px", width: "100px" }} />
            </div>
            <h2 className="text-xl font-medium text-center my-4">
              Your Password has been reset!
            </h2>
          </div>
          <div className="mt-6">
            <button
              className="w-full py-3 px-4 bg-black text-white rounded-full"
              onClick={() => {
                if (currentUser) {
                  // Redirect to home if the user is logged in
                  router.push("/home");
                } else {
                  // Redirect to login if the user is not logged in
                  router.push("/login");
                }
              }}
            >
              Open Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
