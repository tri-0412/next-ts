import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  User,
} from "firebase/auth"; // Import getAuth
import { getFirestore } from "firebase/firestore"; // Import getFirestore

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

/**
 * Tạo tài khoản tạm thời với email
 */

export const createTemporaryAccount = async (email: string) => {
  try {
    // Kiểm tra xem email đã được đăng ký chưa
    await fetchSignInMethodsForEmail(auth, email);

    const tempPassword = "Temporary#123"; // Mật khẩu tạm
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      tempPassword
    );
    console.log("User created successfully:", userCredential.user);

    // Gửi email xác minh

    await sendEmailVerification(userCredential.user);
    console.log("Verification email sent to:", email);

    // Tự động đăng nhập với mật khẩu tạm thời
    await signInWithEmailAndPassword(auth, email, tempPassword);
    return userCredential.user;
  } catch (error) {
    console.log("Error creating user:", error);
    throw error;
  }
};
export const resendVerificationEmail = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("Không tìm thấy người dùng để gửi email xác minh.");
    }

    await sendEmailVerification(auth.currentUser);
    alert("Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error resending verification email:", error.message);
    alert(
      "Không thể gửi lại email xác minh. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
    );
  }
};

/**
 * Gửi email xác minh
 */
export const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
      console.log("Verification email sent successfully.");
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  } else {
    console.log("No user is logged in to send verification email.");
  }
};

/**
 * Cập nhật mật khẩu
 */
export const updateUserPassword = async (newPassword: string) => {
  const currentUser = auth.currentUser;
  console.log("Current user:", currentUser);

  if (!currentUser) {
    throw new Error("User is not logged in.");
  }

  try {
    await updatePassword(currentUser, newPassword);
    console.log("Password updated successfully.");
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

/**
 * Đăng nhập bằng email và mật khẩu
 */
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      // Gửi lại email xác minh
      await sendEmailVerification(user);
      throw new Error("Vui lòng xác minh email trước khi đăng nhập.");
    }

    return user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Lỗi trong quá trình đăng nhập:", error.message);
    throw error;
  }
};

/**
 * Đăng nhập bằng Google
 */
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error during Google login:", error.message);
    throw error;
  }
};

/**
 * Theo dõi trạng thái người dùng
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const monitorAuthState = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Gửi email đặt lại mật khẩu
 */
export const resetPassword = async (email: string) => {
  try {
    // Kiểm tra email đã đăng ký chưa
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signInMethods.length === 0) {
      throw new Error("Email is not registered. Please check again.");
    }

    // Kiểm tra xem email đã xác minh hay chưa (Firebase không trả về thông tin này trực tiếp, nhưng bạn có thể dựa vào signInMethods)
    if (!signInMethods.includes("password")) {
      throw new Error(
        "Email is not verified or not using a password sign-in method."
      );
    }

    // Gửi email đặt lại mật khẩu
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully.");
    return { success: true };
  } catch (error) {
    console.error("Error during password reset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error.",
    };
  }
};

/**
 * Đăng xuất
 */
export const logout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    localStorage.removeItem("userToken"); // Xóa token khỏi localStorage
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

export const logoutAndReauthenticate = async () => {
  const auth = getAuth();
  await signOut(auth);
  console.log("Logged out. Please log in again.");
};

// Kiểm tra token khi ứng dụng khởi động
export const autoLoginWithToken = async () => {
  const auth = getAuth();
  const token = localStorage.getItem("userToken");

  if (token) {
    try {
      // Đăng nhập lại bằng token nếu có
      await signInWithCustomToken(auth, token);
      console.log("User logged in with token.");
    } catch (error) {
      console.error("Error logging in with token:", error);
      localStorage.removeItem("userToken"); // Xóa token nếu đăng nhập không thành công
    }
  } else {
    console.log("No token found. User needs to log in.");
  }
};

// Lấy token mới nếu cần thiết
export const refreshUserToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const token = await user.getIdToken(true); // true để làm mới token
      localStorage.setItem("userToken", token); // Lưu lại token mới
      console.log("Token refreshed successfully.");
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  } else {
    console.log("No user is logged in to refresh token.");
  }
};

//
export const loginUser = async (email: string, password: string) => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Lưu token vào localStorage
    const token = await user.getIdToken(); // Lấy token của người dùng
    localStorage.setItem("userToken", token); // Lưu token vào localStorage
  } catch (error) {
    console.error("Error during login:", error);
  }
};
// Thực hiện reauthentication
export const reauthenticateUser = async (email: string, password: string) => {
  const user = auth.currentUser;

  // Kiểm tra nếu không có người dùng, return false
  if (!user) throw new Error("No current user.");

  // Tạo credential từ email và password
  const credential = EmailAuthProvider.credential(email, password);
  try {
    // Đăng nhập lại người dùng
    await reauthenticateWithCredential(user, credential);
    console.log("Reauthenticated successfully.");
    return true; // Đăng nhập lại thành công
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during reauthentication:", error.message);
    } else {
      console.error("Unknown error during reauthentication");
    }
    return false; // Lỗi khi đăng nhập lại
  }
};

export { auth, firestore, app };
