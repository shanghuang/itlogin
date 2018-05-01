import React, { Component } from 'react';
import { BrowserRouter, Route, Link, withRouter } from 'react-router-dom'
import {connect} from 'react-redux'
import PropTypes, {instanceOf} from 'prop-types';
import Management from './management'
import Login from './login'
import Register from './register'
import api from './shared/apiHelper'
//import cookie from 'cookie'
import { withCookies, Cookies } from 'react-cookie';

import {loginAction, logoutAction} from './actions'

//import { Login } from'./login.jsx'
//import { Register } from'./register.jsx'

import logo from './logo.svg';
import './App.css';

class Layout extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
        username:props.username,
        access_token:props.access_token,
      }

  }

  componentWillMount(){
    var token = this.props.cookies.get('admin_access_token');
    if(token){
      api.get('/employee').end( (err, result) => {
        if(!err){
          //Actions.setUserInfo(null);
          this.props.onReturn({
                'username': result.body.name,//this.refs.username.value,
                'email': "",
                'access_token':token,
              });
          //cookie.remove('admin_access_token');
          //this.context.history.pushState(null, '/manage/user');
        }
        else {
          this.props.cookies.remove('admin_access_token');
          //this.context.history.pushState(null, '/login');
        }

      });
    }
  }

  logout(event){
    event.preventDefault();
    /*var access_token = cookie.load('access_token');
    var data={
      access_token:access_token,
    };*/
    api.del('/access_token').end( (err, result) => {
      if(!err){
        //Actions.setUserInfo(null);
        this.props.onLogout();
        Cookies.remove('admin_access_token');
        this.context.history.pushState(null, '/login');
      }
    });
  }

  login(event){
    event.preventDefault();
    this.props.history.push('/login');
  }

  render() {
    return (
<div>
  <nav className="navbar navbar-default">
    <div className="container-fluid">

      <div className="navbar-header">
        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <a className="navbar-brand" href="#">Brand</a>
      </div>


      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul className="nav navbar-nav">
          <li className="active"><a href="#">Link <span className="sr-only">(current)</span></a></li>
          <li><a href="#">Link</a></li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span className="caret"></span></a>
            <ul className="dropdown-menu">
              <li><a href="#">Action</a></li>
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here</a></li>
              <li role="separator" className="divider"></li>
              <li><a href="#">Separated link</a></li>
              <li role="separator" className="divider"></li>
              <li><a href="#">One more separated link</a></li>
            </ul>
          </li>
        </ul>
        <form className="navbar-form navbar-left" role="search">
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Search"  />
          </div>
          <button type="submit" className="btn btn-default">Submit</button>
        </form>
        <ul className="nav navbar-nav navbar-right">
          { this.state.username ?
              <div>
                <li><a href="#">Hi! {this.state.username}</a></li>
                <li><button type="button" className="btn btn-default" onClick={this.logout}>Logout</button></li>
              </div>
            :
              <li><button type="button" className="btn btn-default" onClick={this.login.bind(this)}>Login</button></li>

          }
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span className="caret"></span></a>
            <ul className="dropdown-menu">
              <li><a href="#">Action</a></li>
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here</a></li>
              <li role="separator" className="divider"></li>
              <li><a href="#">Separated link</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <div id="" className="container">
    { this.state.access_token ? 
        (<Login />)
      : (
      <div>
        <Route path="/" exact component={Management} />
        <Route path='/manage' component={Management} />
        <Route path='/login' component={Login} />
        <Route path='/register' component={Register} />
      </div>
      )
    }
  </div>
</div>
);
  }
}

Layout.contextTypes = {
  history: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps){
  return {
    username : state.userStates? state.userStates.username : null,
    access_token: state.userStates? state.userStates.access_token : null,
  };
};

function mapDispatchToProps(dispatch, ownProps){
  return {
      onLogout: function(){
        dispatch(logoutAction())
      },

      onReturn:function(params){
        dispatch(loginAction(params))
      }
   };
}

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(Layout));

export default withRouter(App);