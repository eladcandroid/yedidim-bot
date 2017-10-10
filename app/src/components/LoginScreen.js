import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signIn } from "../actions/dataSourceActions";


class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {id: '', phone: '', error: undefined, signingIn: false};
  }

  onSignIn() {
    if (this.state.id.length < 3){
      this.setState({error: 'מספר מוקדן שגוי. הזן 3 ספרות'});
      return;
    }
    if (this.state.phone.length < 10){
      this.setState({error: 'מספר טלפון שגוי. הזן 10 ספרות'});
      return;
    }
    this.setState({signingIn: true});
    this.props.signIn(this.state.id, this.state.phone, this.showError.bind(this));
  }

  showError(error) {
    this.setState({signingIn: false, error});
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>כניסה</Text>
        <Text>מספר מוקדן</Text>
        <TextInput style={styles.input}
                   editable = {true}
                   onChangeText={(text) => this.setState({id: text, error: undefined})}
                   maxLength={3}
                   value={this.state.id}/>
        <Text>מספר טלפון</Text>
        <TextInput style={styles.input}
                   editable = {true}
                   onChangeText={(text) => this.setState({phone: text, error: undefined})}
                   maxLength={10}
                   value={this.state.phone}/>
        <View style={styles.button}>
          <Button
            disabled={this.state.signingIn}
            onPress={this.onSignIn.bind(this)}
            title="התחבר"
          />
          <Text style={styles.error}>{this.state.error ? this.state.error : ''}</Text>
        </View>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signIn: (id, phone, onError) => {
      dispatch(signIn(id, phone, onError));
    }
  };
};

export default connect(null, mapDispatchToProps)(LoginScreen);

LoginScreen.propTypes = {
  signIn: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 20,
    marginLeft: 20
  },
  header: {
    paddingBottom: 20,
    fontSize: 20,
    alignSelf: 'stretch',
    textAlign: 'center'
  },
  input: {
    height: 40,
    alignSelf: 'stretch',
    borderColor: '#D3D3D3',
    borderWidth: 1
  },
  button: {
    paddingTop: 60,
    alignSelf: 'stretch'
  },
  error: {
    paddingTop: 40,
    color: 'red',
    alignSelf: 'stretch',
    textAlign: 'center'
  }
});