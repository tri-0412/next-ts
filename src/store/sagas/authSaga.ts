import { call, put, takeEvery } from "redux-saga/effects";
import { loginSuccess, loginFailure, loginRequest } from "../authSlice";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { auth } from "../../../firebase/firebase";

// Định nghĩa kiểu LoginAction
interface LoginAction {
  type: string; // Type của action
  payload: {
    email: string;
    password: string;
  };
}

// Chuyển đổi từ Firebase User sang kiểu User của bạn
interface User {
  id: string;
  email: string;
}

function mapFirebaseUser(firebaseUser: import("firebase/auth").User): User {
  return {
    id: firebaseUser.uid, // Firebase sử dụng `uid` làm ID
    email: firebaseUser.email || "", // Firebase có thể trả về null cho email
  };
}

// Sử dụng generator function cho Saga
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* loginSaga(action: LoginAction): Generator<any, void, UserCredential> {
  try {
    const { email, password } = action.payload;
    const userCredential: UserCredential = yield call(
      signInWithEmailAndPassword,
      auth,
      email,
      password
    );
    const user = mapFirebaseUser(userCredential.user); // Ánh xạ dữ liệu
    yield put(loginSuccess(user));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    yield put(loginFailure(error.message));
  }
}

export function* watchLogin() {
  yield takeEvery(loginRequest.type, loginSaga);
}
