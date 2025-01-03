"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { RiErrorWarningLine } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";
import { CiCircleCheck } from "react-icons/ci";
import {
  auth,
  createTemporaryAccount,
  loginWithGoogle,
  updateUserPassword,
} from "../../../firebase/firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";

// Assume this is where your Firebase auth is initialized

const SignUpPage = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false); // Đảm bảo đồng bộ hóa CSR
  const [step, setStep] = useState<
    "signup" | "welcome" | "createPassword" | "verifyEmail" | "congratulations"
  >("signup");
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false); // Trạng thái hiển thị mật khẩu
  const [isPasswordVisible2, setIsPasswordVisible2] = useState<boolean>(false); // Trạng thái hiển thị mật khẩu
  const [passwordError, setPasswordError] = useState<React.ReactNode>("");
  const [confirmPasswordError, setConfirmPasswordError] =
    useState<React.ReactNode>("");
  const [showErrorChecked, setShowErrorChecked] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [valuesVerifyMail, setValuesVerifyMail] = useState<string[]>(
    Array(6).fill("")
  );
  const inputsEmailOTPRef = useRef<(HTMLInputElement | null)[]>([]);
  const [isResendDisable, setIsResendDisable] = useState<boolean>(true);
  const [resendCountdown, setResendCountdown] = useState(60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [emailError, setEmailError] = useState<boolean>(false);
  const router = useRouter();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    router.push(isLogin ? "/signup" : "/login");
  };
  useEffect(() => {
    setIsClient(true); // Chỉ render nội dung sau khi client tải xong

    if (typeof window !== "undefined") {
      sessionStorage.setItem("previousPage", window.location.href); // Lưu lại trang trước đó
    }

    // Tự động focus vào ô input đầu tiên khi form được render
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);
  useEffect(() => {
    if (step === "verifyEmail") {
      // Khởi động đến ngược khi vào form
      setIsResendDisable(true);
      setResendCountdown(60);

      intervalRef.current = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsResendDisable(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current!);
    }
  }, [step]);

  if (!isClient) return null; // Tránh render trên server
  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const isEmailValid =
    email && /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Đánh dấu các input đã bị "touched" để hiển thị lỗi
    setEmailTouched(true);

    if (!isEmailValid) {
      return; // Dừng nếu có lỗi
    }

    try {
      // Kiểm tra xem email đã tồn tại hay chưa
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0) {
        // Email đã được đăng ký
        setEmailError(true);
      }

      await createTemporaryAccount(email);
      setStep("welcome"); // Chuyển sang giao diện Welcome

      // Xử lý đăng nhập (nếu không có lỗi)
      console.log("Đang đăng nhập với:", { email });
    } catch (error) {
      if (error instanceof FirebaseError) {
        // Kiểm tra lỗi cụ thể
        if (error.code === "auth/email-already-in-use") {
          setEmailError(true);
        } else {
          setEmailError(false);
        }
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      console.log("Logged in with Google :", user);
      router.push("/home");
    } catch (error) {
      if (error instanceof Error) {
        console.log("Google sign-in error:", error.message);
      } else {
        console.log("Unknown error:", error);
      }
    }
  };

  const handleChangeInputOTP = (index: number, value: string) => {
    // chỉ cho phép nhận kí tự từ 0-9
    if (/^\d?$/.test(value)) {
      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);

      // Chuyển sang ô tiếp theo nếu nhập xong
      if (index < values.length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      // Xóa và chuyển về ô trước đó nếu đang xóa mà ô hiện tại rỗng
      inputsRef.current[index - 1]?.focus();
    }
  };

  const togglePasswordVisibility1 = () => {
    setIsPasswordVisible((prev) => !prev); // Thay đổi trạng thái hiển thị mật khẩu
  };
  const togglePasswordVisibility2 = () => {
    setIsPasswordVisible2((prev) => !prev); // Thay đổi trạng thái hiển thị mật khẩu
  };

  const toggleCheck = () => {
    setChecked(!checked);
  };
  const handleSubmitCreatePassword = async (e: {
    preventDefault: () => void;
  }) => {
    e.preventDefault();

    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()]{6,20}$/;
    let hasError = false;

    setIsSubmitted(true); // Đánh dấu đã submit
    setPasswordError("");
    setConfirmPasswordError("");
    setShowErrorChecked(false);

    // Kiểm tra định dạng mật khẩu
    if (!passwordRegex.test(password)) {
      setPasswordError(
        <>
          <RiErrorWarningLine className="inline" />
          &nbsp;Password must be 6-20 characters long and can only contain
          letters, numbers, and !@#$%^&*().
        </>
      );
      hasError = true;
    }

    // Kiểm tra khớp mật khẩu
    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError(
        <>
          <RiErrorWarningLine className="inline" />
          &nbsp;Passwords do not match.
        </>
      );
      hasError = true;
    }
    // Kiểm tra checkbox
    if (!checked) {
      setShowErrorChecked(true); // Hiển thị lỗi checkbox
      hasError = true;
    }
    // Nếu có lỗi, dừng xử lý
    if (hasError) {
      return;
    }

    try {
      // Thực hiện cập nhật mật khẩu
      await updateUserPassword(password);
      setStep("congratulations");
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  };

  const handlePasswordBlur = () => {
    setPasswordError(
      <>
        <RiErrorWarningLine className="inline" />
        &nbsp;Password must be 6-20 characters long and can only contain
        letters, numbers, and !@#$%^&*().
      </>
    );
  };
  const handlePasswordBlur2 = () => {
    setConfirmPasswordError(
      <>
        <RiErrorWarningLine className="inline" />
        &nbsp;Passwords do not match.
      </>
    );
  };
  const handleVerifyEmailOTP = (index: number, valueOTP: string) => {
    if (/^[a-zA-Z0-9]*$/.test(valueOTP)) {
      const newValuesOTP = [...valuesVerifyMail];
      newValuesOTP[index] = valueOTP; // Cập nhật giá trị OTP tại vị trí chỉ định
      setValuesVerifyMail(newValuesOTP);

      // Chuyển sang ô tiếp the nếu nhập xong
      if (valueOTP && index < inputsEmailOTPRef.current.length - 1) {
        inputsEmailOTPRef.current[index + 1]?.focus();
      }
    }
  };

  const VerifyEmailValid = valuesVerifyMail.every(
    (valueOTP) => valueOTP.trim() !== "" // Kiểm tra tất cả các ô đều đã nhập
  );
  const handleKeyDownEmailOTP = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !valuesVerifyMail[index] && index > 0) {
      // Xóa và chuyển về ô trước đó nếu đang xóa mà ô hiện tại rỗng
      inputsEmailOTPRef.current[index - 1]?.focus();
    }
  };
  const handleSubmitVerifyEmail = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (VerifyEmailValid) {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        // Nếu người dùng chưa đăng nhập, thông báo lỗi
        setConfirmPasswordError(
          <>
            <RiErrorWarningLine className="inline" />
            &nbsp;User not logged in.
          </>
        );
        return;
      }
    }
  };

  const handleResendEmailHandler = async () => {
    try {
      setIsResendDisable(true);
      setResendCountdown(60);
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error:", error.message);
      } else {
        console.log("Unknown error:", error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-100 via-purple-100 to-purple-200">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 z-10">
        <div className="text-2xl font-bold">Gradient</div>

        <div className="relative rounded-full bg-[#F4F4F3] text-[#E0E0E0] h-8 flex text-xs font-medium">
          <div className="absolute left-0 top-0 h-full rounded-full bg-[#3C404F] transition-left duration-500"></div>
          <button
            className={`px-4 py-2 rounded-full flex items-center justify-center transition-colors duration-500 ${
              isLogin ? "bg-gray-100 text-black" : "bg-gray-800 text-white"
            }`}
            onClick={() => router.push("/login")}
          >
            Log In
          </button>
          <button
            className={`px-4 py-2 rounded-full flex items-center justify-center transition-colors duration-500 ${
              !isLogin ? "bg-gray-100 text-black" : "bg-gray-800 text-white"
            }`}
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Form */}

      {step === "signup" && (
        <div className="w-full md:max-w-md max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-medium text-center">Sign Up</h2>
          <p className="text-center text-sm text-[#B2B2B2] mt-2">
            Start your journey on Gradient Network and shape the future of
            compute.
          </p>
          <form onSubmit={handleSignUpSubmit} className="space-y-4 mt-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                type="email"
                placeholder="Enter Email"
                className="mt-1 block w-full px-5 py-2 border border-gray-200 rounded-full shadow-sm hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] focus:outline-none text-sm"
              />
            </div>

            {/* Buttons */}
            {/* Show email error message if already registered */}
            {emailError ? (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <RiErrorWarningLine />
                Email already registered,{" "}
                <a href="/login" className="underline">
                  Login
                </a>{" "}
                or{" "}
                <a href="/forgotpassword" className="underline">
                  {" "}
                  Reset Password
                </a>{" "}
              </p>
            ) : (
              <div className="h-6 overflow-hidden">
                {emailTouched && !isEmailValid && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <RiErrorWarningLine />
                    Please enter a valid email address.
                  </p>
                )}
              </div>
            )}
            <div className="h-6 w-full flex-row items-start mt-[-1rem] mb-4"></div>
            <button
              type="submit"
              className="relative w-full flex items-center justify-center bg-black text-white py-2.5 px-4 rounded-full hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
            >
              Confirm
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

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full border border-gray-300 text-black py-2.5 px-5 text-sm rounded-full flex items-center justify-center space-x-2 group-hover hover:text-[#1677ff] hover:border-[#1677ff] "
            >
              <FcGoogle />
              <span>Sign up with Google</span>
            </button>

            {/* Switch between Log In and Sign Up */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={toggleAuthMode}
              >
                Log In
              </button>
            </p>
          </form>
        </div>
      )}

      {step === "welcome" && (
        <div className="w-full md:max-w-md max-w-2xl bg-white rounded-2xl shadow-lg p-8 text-center  relative">
          <div
            className=" cursor-pointer left-7 top-9 absolute "
            onClick={() => setStep("signup")}
          >
            <IoIosArrowBack />
          </div>
          <h2 className=" text-lg font-semibold">A Special Welcome</h2>
          <div className=" text-center font-medium text-sm  text-[#B2B2B2] mt-2">
            New users only: Supercharge your journey with a friend&apos;s
            referral code for
            <div className=" font-medium text-black">
              {" "}
              3,000 EXP and a 2% reward boost
            </div>
          </div>

          <div className="flex items-center justify-between my-12">
            {[...Array(6)].map((value, index) => (
              <input
                value={values[index]}
                onChange={(e) => handleChangeInputOTP(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                type="text"
                key={index}
                className="h-12 w-12 bg-[#0000000a] rounded-md text-center text-lg outline-none"
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                maxLength={1} // chỉ cho phép nhập 1 ký tự
              />
            ))}
          </div>
          {/* Buttons */}
          <button
            // onClick={handleSignUpSubmit}
            type="submit"
            className="relative w-full flex items-center justify-center bg-black text-white py-2 px-4 rounded-full hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
          >
            Get Boosted
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
          <p className=" mt-4 text-xs text-gray-500">
            <button
              className=" text-base underline mr-1"
              onClick={() => setStep("createPassword")}
            >
              {" "}
              Skip{" "}
            </button>{" "}
            (you won&apos;t see this boost again)
          </p>
        </div>
      )}
      {step === "createPassword" && (
        <div className="w-full md:max-w-md max-w-2xl bg-white rounded-2xl shadow-lg p-8 relative">
          <div
            className=" cursor-pointer left-7 top-9 absolute "
            onClick={() => setStep("welcome")}
          >
            <IoIosArrowBack />
          </div>
          <h2 className="text-xl font-medium text-center">Sign Up</h2>
          <div className="text-center text-sm text-[#B2B2B2] mt-2">
            Start your journey on Gradient Network and shape the future of
            compute.
          </div>
          <form
            onSubmit={handleSubmitCreatePassword}
            className="space-y-4 mt-6"
          >
            {/* Create Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Create Password
              </label>
              <div className="relative">
                <input
                  onBlur={handlePasswordBlur}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type={isPasswordVisible ? " text" : "password"}
                  placeholder="Confirm Password"
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
                  <p className="text-[#FF5454] text-xs">{passwordError}</p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  onBlur={handlePasswordBlur2}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={isPasswordVisible2 ? " text" : "password"}
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
                  <p className="text-red-500 text-xs">{confirmPasswordError}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="">
              <button
                disabled={!checked && !password && !confirmPassword}
                type="submit"
                className="relative mb-2 w-full flex items-center justify-center bg-black text-white py-3 px-4 rounded-full hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
              >
                Sign Up
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
              <div className="flex flex-row justify-start items-start text-xs whitespace-nowrap">
                <div
                  onClick={toggleCheck}
                  className={`w-4 h-4 border-2 items-center flex rounded-md cursor-pointer mr-1 md:mr-2 flex-shrink-0 md:w-5 md:h-5  ${
                    checked
                      ? "bg-white  border-blue-500"
                      : "bg-white border-blue-500"
                  }`}
                >
                  {checked && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div className=" flex flex-row justify-start flex-wrap">
                  I agree with Gradient Network &nbsp;
                  <div className="font-bold underline hover:underline cursor-pointer">
                    Terms of Service
                  </div>
                  &nbsp; and&nbsp;
                  <div className="font-bold underline hover:underline cursor-pointer">
                    Privacy Policy.
                  </div>
                </div>
              </div>
              {showErrorChecked && isSubmitted && !checked && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <RiErrorWarningLine />
                  You must agree to the Terms of Service and Privacy Policy
                  before continuing.
                </p>
              )}
            </div>
          </form>
        </div>
      )}
      {step === "verifyEmail" && (
        <div className="w-full md:max-w-md max-w-2xl bg-white rounded-2xl shadow-lg p-8 relative">
          <div className="w-full flex flex-row justify-center  items-center">
            <HiOutlineMail style={{ height: "100", width: "100" }} />
          </div>
          <h2 className="text-xl font-medium text-center">Verify your email</h2>
          <div className="text-center text-sm text-[#B2B2B2] mt-2">
            Enter the 6-digit verification code we sent to your inbox below:
          </div>
          <form onSubmit={handleSubmitVerifyEmail} className="space-y-4 mt-6">
            {/* Verify your email */}
            <div className="flex items-center justify-between my-12">
              {[...Array(6)].map((_, index) => (
                <input
                  value={valuesVerifyMail[index]}
                  onChange={(e) => handleVerifyEmailOTP(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDownEmailOTP(index, e)}
                  type="text"
                  key={index}
                  className="h-12 w-12 bg-[#0000000a] rounded-md text-center text-lg outline-none"
                  ref={(el2) => {
                    inputsEmailOTPRef.current[index] = el2;
                  }}
                  maxLength={1} // chỉ cho phép nhập 1 ký tự
                />
              ))}
            </div>
            <div className="h-4  overflow-hidden"></div>
            {/* Error message */}
            {confirmPasswordError && (
              <div className="text-red-500">{confirmPasswordError}</div>
            )}
            {/* Buttons */}
            <div className="">
              <button
                type="submit"
                disabled={!VerifyEmailValid} // Disable nếu chưa nhập đủ
                className={`relative w-full flex items-center justify-center py-3 px-4 rounded-full text-white ${
                  VerifyEmailValid
                    ? "bg-black hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
                    : "bg-black bg-opacity-20 cursor-not-allowed"
                }`}
              >
                Verify
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
            <div className="">
              <button
                disabled={isResendDisable}
                onClick={handleResendEmailHandler}
                type="button"
                className={`relative w-full flex items-center justify-center py-3 px-4 rounded-full text-white ${
                  !isResendDisable
                    ? "bg-black hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
                    : "bg-black bg-opacity-20 cursor-not-allowed"
                }`}
              >
                {isResendDisable
                  ? `Resend Email (${resendCountdown}s)`
                  : "Resend Email"}
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
          <div className="h-4 w-full flex flex-row items-start mt-[-1rem] mb-4"></div>

          <div className="my-4">
            <div className="w-full flex flex-row justify-center items-center mt-4">
              <CiCircleCheck style={{ height: "100px", width: "100px" }} />
            </div>
            <h2 className="text-xl font-medium text-center my-4">
              Congratulations! Your email has been verified!
            </h2>
          </div>
          <div className="h-6 w-full flex-row items-start mt-[-1rem] mb-4"></div>

          <div className="mt-6">
            <button
              className="w-full py-3 px-4 bg-black text-white rounded-full"
              onClick={() => router.push("/home")}
            >
              Open Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
