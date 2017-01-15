import React, { Component } from 'react';
import './Todo.css';
import $ from 'jquery';
import { Row, Col, Table, Label, Form, FormControl, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-bootstrap-date-picker";
import 'font-awesome/css/font-awesome.css';


class TodoCheck extends Component {
    constructor(props) {
        super(props);
        this.state = { check: false };
        this.handleCheck = this.handleCheck.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }
    componentDidMount() {
        this.setState({ check: this.props.check });
    }
    handleMouseEnter() {
        this.setState({ check: !this.props.check });
    }
    handleMouseLeave() {
        this.setState({ check: this.props.check });
    }
    handleCheck() {
        var todo = this.props.todo;
        var GetTodos = this.props.getTodos;
        todo.done = !todo.done;
        $.post('api/todos/' + todo.id, todo)
            .done((data) => GetTodos(data));
    }
    render() {
        return <td className="TodoCheck" onClick={this.handleCheck}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}><i className={"fa fa-" + (this.state.check ? "check-" : "") + "square-o"}></i></td>;
    }
}

class TodoAlias extends Component {
    render() {
        return (
            <td className="TodoAlias"><Label bsStyle={this.props.done ? "default" : "primary"}>{this.props.alias}</Label></td>
        );
    }
}

class TodoText extends Component {
    render() {
        return (
            <td className="TodoText">{this.props.text}</td>
        );
    }
}

class TodoDeadline extends Component {
    render() {
        if (this.props.deadline) {
            var dl = new Date(this.props.deadline);
            return <td className="TodoDeadline">{dl.toLocaleDateString()}</td>
        }
        return <td className="TodoDeadline" />;
    }
}

class TodoDelete extends Component {
    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }
    handleDelete() {
        var GetTodos = this.props.getTodos;
        $.ajax({
            url: 'api/todos/' + this.props.id,
            type: 'DELETE',
            success: (data) => GetTodos(data)
        });
    }
    render() {
        return (
            <td className="TodoDelete" onClick={this.handleDelete}><i className="fa fa-trash-o"></i></td>
        );
    }
}

class TodoTask extends Component {
    constructor(props) {
        super(props);
        this.state = { form: false };
    }
    componentWillMount() {
        if (this.props.todo.done) {
            this.setState({ form: false });
        }
    }
    render() {
        var todo = this.props.todo;
        if (this.state.form) {
            return (
                <div className="TodoTask">

                </div>
            );
        }
        else {
            return (
                <tr className={"TodoTask" + (todo.done ? " Done" : "")}>
                    <TodoCheck getTodos={this.props.getTodos} check={todo.done} todo={todo} />
                    <TodoAlias done={todo.done} alias={todo.alias} todo={todo} />
                    <TodoText text={todo.text} todo={todo} />
                    <TodoDeadline deadline={todo.deadline} todo={todo} />
                    <TodoDelete getTodos={this.props.getTodos} id={todo.id} todo={todo} />
                    <td>
                        <span>...</span>
                    </td>
                </tr>
            );
        }
    }
}

class TodoTable extends Component {
    render() {
        var title = "";
        if (this.props.priority === -1) title = "CYCLE";
        else if (this.props.priority <= 0) title = "ERROR";
        else title = "P" + this.props.priority;
        return (
            <Row>
                <Col xs={12}>{title}</Col>
                <Col xs={12}>
                    <Table hover striped>
                        <tbody>
                            {this.props.todos.map((todo) =>
                                <TodoTask getTodos={this.props.getTodos} todo={todo} />
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        );
    }
}

class TodoList extends Component {
    render() {
        var todoTables = {};
        var todoPriority = [];
        this.props.todos.forEach(function (todo) {
            if (!todoTables[todo.priority]) {
                todoTables[todo.priority] = [];
            }
            todoTables[todo.priority].push(todo);
            if (todoPriority.length === 0 || todoPriority[todoPriority.length - 1] !== todo.priority) {
                todoPriority.push(todo.priority);
            }
        });
        return (
            <Row>
                <Col sm={1}></Col>
                <Col sm={10} className="TodoList">
                    {todoPriority.map((p) =>
                        <TodoTable getTodos={this.props.getTodos} todos={todoTables[p]} priority={p} />
                    )}
                </Col>
            </Row>
        );
    }
}

class TodoForm extends Component {
    constructor(props) {
        super(props);
        var state = {
            form: {},
            todo: this.props.todo || null,
            dropdown: []
        }
        if (state.todo) {
            state.form.text = state.todo.text;
            state.form.prev = state.todo.prev.join(',');
            state.form.dealline = state.todo.dealline;
        }

        this.state = state;
        this.onChangeText = this.onChangeText.bind(this);
        this.onChangePrev = this.onChangePrev.bind(this);
        this.onChangeDeadline = this.onChangeDeadline.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    onChangeText(e) {
        e.preventDefault();
        var state = this.state;
        state.form.text = e.target.value;
        this.setState(state);
    }
    onChangePrev(e) {
        e.preventDefault();
        var state = this.state;
        state.form.prev = e.target.value;
        this.setState(state);
    }
    onChangeDeadline(e) {
        e.preventDefault();
        var state = this.state;
        state.form.deadline = e.target.value;
        this.setState(state);
    }
    handleReset(e) {
        e.preventDefault();
        var state = this.state;
        state.form.text = "";
        state.form.prev = "";
        state.form.dealline = "";
        this.setState(state);
    }
    handleSubmit(e) {
        var state = this.state;
        var GetTodos = this.props.getTodos;
        $.ajax({
            type: 'POST',
            url: '/api/todos',
            data: state.form
        })
            .done(function (data) {
                var state = this.state;
                state.form.text = "";
                state.form.prev = "";
                state.form.dealline = "";
                this.setState(state);
                GetTodos(data);
            })
            .fail(function (jqXhr) {
                console.log('failed to register');
            });
    }
    render() {
        var buttonText = this.state.todo ? "Update" : "Submit";
        return (
            <Row>
                <Col sm={3}></Col>
                <Col sm={6} className="TodoForm">
                    <Form horizontal>
                        <FormGroup>
                            <FormControl type="text" placeholder="Todo" onChange={this.onChangeText} value={this.state.form.text} />
                        </FormGroup>
                    </Form>
                    <Form inline>
                        <FormGroup>
                            <FormControl type="text" placeholder="Previous tasks" onChange={this.onChangePrev} value={this.state.form.prev} />
                        </FormGroup>
                        {' '}
                        <FormGroup>
                            <DatePicker onChangeDeadline={this.onChangeDeadline} value={this.state.form.deadline} />
                        </FormGroup>
                        {' '}
                        <FormGroup>
                            <Button bsStyle="link" type="reset" onClick={this.handleReset}>Reset</Button>
                        </FormGroup>
                        {' '}
                        <FormGroup>
                            <Button bsStyle="primary" type="submit" onClick={this.handleSubmit}>{buttonText}</Button>
                        </FormGroup>
                    </Form>
                </Col>
            </Row>
        );
    }
}

class Todo extends Component {
    constructor(props) {
        super(props);
        this.state = { todos: [] };
        this.GetTodos = this.GetTodos.bind(this);
    }

    componentDidMount() {
        this.GetTodos();
    }

    GetTodos(data) {
        if (data) {
            this.setState({ todos: data });
        }
        else {
            $.getJSON('api/todos')
                .then((data) => this.setState({ todos: data }));
        }
    }
    render() {
        var aliases = [];
        this.state.todos.forEach(function (todo) {
            aliases.push(todo.alias);
        });
        return (
            <Row>
                <TodoForm getTodos={this.GetTodos} aliases={aliases} />
                <TodoList getTodos={this.GetTodos} todos={this.state.todos} />
            </Row>
        );
    }
}
export default Todo;