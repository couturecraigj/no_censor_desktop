import React from 'react';
import { Formik, Form } from 'formik';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { COOKIE_TYPE_MAP } from '../../../../common/types';
import TextInput from '../../components/TextInput';

const onSubmit = values => {
  ipcRenderer.send('authentication-success', values);
};
// const onCancel = () => {
//   ipcRenderer.send('authentication-failure');
// };

const initialValues = {
  nameEmail: '',
  password: ''
};

const LOGIN = gql`
  mutation Login($nameEmail: String!, $password: String!) {
    logIn(nameEmail: $nameEmail, password: $password) {
      token
      me {
        id
        userName
        email
      }
    }
  }
`;

// const clearVariableValues = eles => {
//   return eles.forEach(el => {
//     el.value = '';
//   });
// };

const Login = () => {
  return (
    <div>
      <Mutation mutation={LOGIN}>
        {(logIn, { client }) => (
          <Formik
            initialValues={initialValues}
            onSubmit={variables =>
              logIn({ variables })
                .then(result => {
                  // actions.resetForm();
                  // console.log(data);
                  window.store.set(
                    COOKIE_TYPE_MAP.token,
                    result.data.logIn.token
                  );
                  window.store.set('userId', result.data.logIn.me.id);
                  onSubmit(result.data.logIn);
                  client.resetStore();

                  // document.cookie = 'token=' + result.data.logIn.token;
                  // location.reload();
                })
                // eslint-disable-next-line no-console
                .catch(console.error)
            }
          >
            {() => (
              <Form>
                <TextInput
                  autoComplete="username"
                  id="Login__name_email"
                  label="Name or Email"
                  name="nameEmail"
                />
                <TextInput
                  id="Login__password"
                  label="Password"
                  type="password"
                  autoComplete="password"
                  name="password"
                />
                <button type="submit">Submit</button>
              </Form>
            )}
          </Formik>
        )}
      </Mutation>
      <div>
        <Link
          to="/sign-up"
          // onMouseOver={Routes.SignUp.load}
          // onFocus={Routes.SignUp.load}
        >
          Sign Up
        </Link>
      </div>
      <div>
        <Link
          to="/account/forgot-password"
          // onMouseOver={Routes.ForgotPassword.load}
          // onFocus={Routes.ForgotPassword.load}
        >
          Forgot Password
        </Link>
      </div>
    </div>
  );
};

export default Login;
