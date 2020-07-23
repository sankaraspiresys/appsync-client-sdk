import React, { Component } from 'react';
import './App.css';

import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { graphqlMutation } from 'aws-appsync-react';
import { buildSubscription } from 'aws-appsync';


const SubscribeToTods = gql`
  subscription {
    onCreateTodo{
      id title completed
    }
  }
`


const CreateTodo = gql`
  mutation($title: String!, $completed: Boolean){
    createTodo(input: {
      title: $title,
      completed: $completed
    }){
      id
      title
      completed
    }
  }
`

const ListTodos = gql`
  query{
    listTodos{
      items {
        id title completed
      }
    }
  }
`

class App extends Component{
  state = {
    todo: ''
  }

  componentDidMount(){
    this.props.subscribeToMore(
      buildSubscription(SubscribeToTods, ListTodos)
    )
  }

  addTodo = () =>{
    if(this.state.todo === '') return

    const todo = {
      title : this.state.todo, completed: false
    }
    this.props.createTodo(todo);
    this.setState({
      todo: ''
    })
  }
  render(){
    return (
      <div className="App">
        <input 
          onChange = {e => this.setState({ todo: e.target.value })}
          value = { this.state.todo }
          placeholder = "Todo Name"
        />
        <button onClick={this.addTodo}>Save</button>
        { this.props.todos.map((item, index) => (
            <p key={index}>{item.title}</p>
          ))
        }
      </div>
    )
  }
}


export default compose(
  graphqlMutation(CreateTodo, ListTodos, 'Todo'),
  graphql(ListTodos, {
    options:  {
      fetchPolicy: "cache-and-network"
    },
    props: props => ({
      subscribeToMore: props.data.subscribeToMore,
      todos: props.data.listTodos ? props.data.listTodos.items: []
    })
  })
)(App);
