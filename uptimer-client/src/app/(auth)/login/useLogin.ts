import { IUserAuth } from "@/interfaces/user.interface";
import { loginSchema, LoginType, RegisterType } from "../validations/auth";
import { Dispatch, useContext, useState } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { FetchResult, MutationFunctionOptions, useMutation } from "@apollo/client";
import { AUTH_SOCIAL_USER, LOGIN_USER } from "@/queries/auth";
import { errorToast } from "@/utils/utils";
import { DispatchProps, MonitorContext } from "@/context/MonitorContext";
import firebaseApp from "../firbase";
import { Auth, getAuth, signInWithPopup, UserCredential, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

export const useLogin = (): IUserAuth => {
    const { dispatch } = useContext(MonitorContext)
    const [validationErrors, setValidationErrors] = useState<LoginType>({
        username: '',
        password: '',
    });

    const router: AppRouterInstance = useRouter();
    const [loginUser, { loading }] = useMutation(LOGIN_USER);

    const onLoginSubmit = async (formData: FormData): Promise<void> => {
        try {
            const resultSchema = loginSchema.safeParse(Object.fromEntries(formData));
            if(resultSchema.success) {
                const result: FetchResult = await loginUser({
                    variables: resultSchema.data
                });
                if(result && result.data) {
                    const { loginUser } = result.data;
                    dispatch({
                        type: 'DATA_UPDATE',
                        payload: {
                            user: loginUser.user,
                            notifications: loginUser.notifications
                        }
                    });
                    router.push('/');
                }
            } else {
                setValidationErrors({
                    username: resultSchema.error.format().username?._errors[0]!,
                    password: resultSchema.error.format().password?._errors[0]!,
                });
            }
        } catch (error) {
            errorToast('Invalid credentials');
        }
    }

    return {
        loading,
        onLoginSubmit,
        validationErrors,
        setValidationErrors
    }
}

export const useSocialLogin = (): IUserAuth => {
    const { dispatch } = useContext(MonitorContext);
    const router: AppRouterInstance = useRouter();
    const [authSocialUser, { loading }] = useMutation(AUTH_SOCIAL_USER);
  
    const loginWithGoogle = async (): Promise<void> => {
      const provider = new GoogleAuthProvider();
      const auth: Auth = getAuth(firebaseApp);
      auth.useDeviceLanguage();
      const userCredential: UserCredential = await signInWithPopup(auth, provider);
      const nameList = userCredential.user.displayName!.split(' ');
      const data = {
        username: nameList[0],
        email: userCredential.user.email,
        socialId: userCredential.user.uid,
        type: 'google'
      };
      submitUserData(data as RegisterType, authSocialUser, dispatch, router, 'social');
    }
  
    const loginWithFacebook = async (): Promise<void> => {
      const provider = new FacebookAuthProvider();
      const auth: Auth = getAuth(firebaseApp);
      auth.useDeviceLanguage();
      const userCredential: UserCredential = await signInWithPopup(auth, provider);
      const nameList = userCredential.user.displayName!.split(' ');
      const data = {
        username: nameList[0],
        email: userCredential.user.email,
        socialId: userCredential.user.uid,
        type: 'facebook'
      };
      submitUserData(data as RegisterType, authSocialUser, dispatch, router, 'social');
    }
  
    return {
      loading,
      authWithGoogle: loginWithGoogle,
      authWithFacebook: loginWithFacebook
    }
  }
  
  async function submitUserData(
    data: LoginType,
    loginUserMethod: (options?: MutationFunctionOptions | undefined) => Promise<FetchResult>,
    dispatch: Dispatch<DispatchProps>,
    router: AppRouterInstance,
    authType: string
  ) {
    try {
      const variables = authType === 'social' ? { user: data } : data;
      const result: FetchResult = await loginUserMethod({ variables });
      if (result && result.data) {
        const { loginUser, authSocialUser } = result.data;
        dispatch({
          type: 'DATA_UPDATE',
          payload: {
            user: authType === 'social' ? authSocialUser.user : loginUser.user,
            notifications: authType === 'social' ? authSocialUser.notifications : loginUser.notifications
          }
        });
        router.push('/status');
      }
    } catch (error) {
      errorToast('Invalid credentials');
    }
  }