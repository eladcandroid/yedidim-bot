import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, TextInput, Button } from 'react-native';
import { signIn } from "../actions/dataSourceActions";


class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {id: '', phone: ''};
  }

  onSignIn() {
    this.props.signIn(this.state.id, this.state.phone);
  }

  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: 20
      }}>
        <Text style={{
          fontSize: 20,
          alignSelf: 'stretch',
          textAlign: 'center'}}>התחבר</Text>
        <Text>מספר מוקדן</Text>
        <TextInput style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}} editable = {true}
                   onChangeText={(text) => this.setState({id: text})}
                   value={this.state.id}/>
        <Text>מספר טלפון</Text>
        <TextInput style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}} editable = {true}
                   onChangeText={(text) => this.setState({phone: text})}
                   value={this.state.phone}/>
        <Button
          onPress={this.onSignIn.bind(this)}
          title="התחבר"
          color="#841584"
        />
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signIn: (id, phone) => {
      dispatch(signIn(id, phone));
    }
  };
};

export default connect(null, mapDispatchToProps)(LoginScreen);

LoginScreen.propTypes = {
  signIn: PropTypes.func
};