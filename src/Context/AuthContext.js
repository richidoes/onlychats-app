import * as React from 'react';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { useDispatch } from 'react-redux';
import { createUser } from '../graphql/mutations';
import { setUser } from '../features/user';
import { getUser } from '../graphql/queries';
import { setChatRooms } from '../features/chatRooms';

const AuthContext = React.createContext({
  authState: 'default',
  setAuthState: () => {},
  email: '',
  setEmail: () => {},
  password: '',
  setPassword: () => {},
  verificationCode: '',
  setVerificationCode: () => {},
  isLoading: false,
  firstName: '',
  setLastName: () => {},
  lastName: '',
  confirmPassword: '',
  setConfirmPassword: () => {},
  setFirstName: () => {},
  handleSignIn: () => {},
  handleSignUp: () => {},
  handleConfirmSignUp: () => {},
  handleForgotPassword: () => {},
  handleResetPassword: () => {},
  handleResendVerificationCode: () => {},
});

const { Provider } = AuthContext;

function AuthProvider({ children }) {
  const [authState, setAuthState] = React.useState('default');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const dispatch = useDispatch();

  async function handleSignIn() {
    if (!email || !password) {
      alert('please enter an email and password');
      return;
    }
    try {
      setIsLoading(true);
      const user = await Auth.signIn({
        username: email,
        password,
      });
      const userFromDB = await API.graphql(
        graphqlOperation(getUser, { id: user.attributes.sub })
      );
      dispatch(
        setUser({
          id: userFromDB.data.getUser.id,
          firstName: userFromDB.data.getUser.firstName,
          lastName: userFromDB.data.getUser.lastName,
          profilePicture: userFromDB.data.getUser.profilePicture,
          email: userFromDB.data.getUser.email.toLowerCase(),
          status: userFromDB.data.getUser.status,
          notificationToken: userFromDB.data.getUser.notificationToken,
          latitude: userFromDB.data.getUser.latitude,
          longitude: userFromDB.data.getUser.longitude,
        })
      );
      if (userFromDB.data.getUser.chatRooms.items !== null) {
        dispatch(setChatRooms(userFromDB.data.getUser.chatRooms.items));
      }
      setIsLoading(false);
      setAuthState('signedIn');
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
    }
  }

  async function handleSignUp() {
    if (!email || !password) {
      alert('Please enter an email and password');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          given_name: firstName,
          family_name: lastName,
        },
      });
      setAuthState('confirmSignUp');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      alert(error.message);
      console.log(error);
    }
  }

  async function handleConfirmSignUp() {
    if (!verificationCode) {
      alert('Please enter verification code');
      return;
    }
    try {
      setIsLoading(true);
      await Auth.confirmSignUp(email, verificationCode);
      const user = await Auth.signIn({
        username: email,
        password,
      });
      await saveUserToDatabase(user);
      alert('Welcome, account created succesfully');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      alert(error.message);
      console.log(error);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      alert('Please enter an email');
      return;
    }
    try {
      setIsLoading(true);
      await Auth.forgotPassword(email);
      setAuthState('confirmForgotPassword');
      setIsLoading(false);
    } catch (e) {
      alert(e.message);
      setIsLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('Please enter a valid verification code');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      await Auth.forgotPasswordSubmit(email, verificationCode, password);
      alert('Password reset successfully, Now you can Sign In');
      setAuthState('signIn');
      setIsLoading(false);
    } catch (e) {
      alert(e.message);
      setIsLoading(false);
    }
  }

  async function handleResendVerificationCode() {
    try {
      await Auth.resendSignUp(email);
      alert(`Successfully resent confirmation code to ${email}`);
    } catch (e) {
      alert(e);
    }
  }

  async function saveUserToDatabase(user) {
    const { attributes } = user;
    const userToSave = {
      id: attributes.sub,
      firstName: attributes.given_name,
      lastName: attributes.family_name,
      profilePicture: null,
      email: attributes.email.toLowerCase(),
      status: null,
      notificationToken: null,
      latitude: null,
      longitude: null,
    };
    try {
      // Create user in DB
      await API.graphql(
        graphqlOperation(createUser, {
          input: userToSave,
        })
      );
      // Save user to redux
      dispatch(setUser(userToSave));
    } catch (e) {
      console.log('Error creating user', e);
    }
  }
  return (
    <Provider
      value={{
        authState,
        setAuthState,
        email,
        setEmail,
        password,
        setPassword,
        handleSignIn,
        handleSignUp,
        handleConfirmSignUp,
        verificationCode,
        setVerificationCode,
        isLoading,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        confirmPassword,
        setConfirmPassword,
        handleForgotPassword,
        handleResendVerificationCode,
        handleResetPassword,
      }}
    >
      {children}
    </Provider>
  );
}

export { AuthContext, AuthProvider };
