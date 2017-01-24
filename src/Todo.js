import React, { Component } from 'react';
import './Todo.css';
import $ from 'jquery';
import { Row, Col, Table, Label, Form, FormControl, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-bootstrap-date-picker";
import 'font-awesome/css/font-awesome.css';

class TodoFa extends Component {
    render() {
        return (<i className={"fa fa-fw " + this.props.icon}></i>);
    }
}

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
            onMouseLeave={this.handleMouseLeave}><TodoFa icon={this.state.check ? "fa-check-circle-o" : "fa-circle-o"} /></td>;
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
    constructor(props) {
        super(props);
        this.handleIcon = this.handleIcon.bind(this);
    }
    handleIcon(text) {
        if (text.startsWith("Wait for ")) return "fa-hourglass-half";
        if (text.startsWith("Read ")) return "fa-file-text";
        if (text.startsWith("May ")) return "fa-coffee";
        if (text.startsWith("Deprecate ") || text.startsWith("Remove ") || text.startsWith("Delete ")) return "fa-minus-circle";
        if (text.startsWith("Test ")) return "fa-tasks";
        if (text.startsWith("Research ") || text.startsWith("Search ")) return "fa-search";
        if (text.startsWith("Talk with ") || text.startsWith("Meet with ")) return "fa-comments-o";
        return null;
    }
    render() {
        return (
            <td className="TodoText"><TodoFa icon={this.handleIcon(this.props.text)} />{this.props.text}</td>
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
            <td className="TodoDelete" onClick={this.handleDelete}><i className="fa fa-fw fa-trash-o"></i></td>
        );
    }
}

class TodoEdit extends Component {
    constructor(props) {
        super(props);
        this.handleEdit = this.handleEdit.bind(this);
    }
    handleEdit() {
        this.props.editTodo(this.props.todo);
    }
    render() {
        return (
            <td className="TodoEdit" onClick={this.handleEdit}><i className="fa fa-fw fa-code-fork"></i></td>
        );
    }
}

class TodoPrev extends Component {
    render() {
        return (
            <td className="TodoPrev">
                {this.props.prev.map((p) =>
                    <Label className={"pull-right"} bsStyle={"primary"}>{p}</Label>
                )}
            </td>
        );
    }
}

class TodoTask extends Component {
    render() {
        var todo = this.props.todo;
        return (
            <tr className={"TodoTask" + (todo.done ? " Done" : "")}>
                <TodoCheck getTodos={this.props.getTodos} check={todo.done} todo={todo} />
                <TodoAlias done={todo.done} alias={todo.alias} todo={todo} />
                <TodoText text={todo.text} todo={todo} />
                <TodoDeadline deadline={todo.deadline} todo={todo} />
                <TodoPrev prev={todo.prevAlias} todo={todo} />
                <TodoEdit editTodo={this.props.editTodo} todo={todo} />
                <TodoDelete getTodos={this.props.getTodos} id={todo.id} todo={todo} />
            </tr>
        );
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
                <Col className={"TodoPriority TodoPriority-" + title} xs={12}>{title}</Col>
                <Col xs={12}>
                    <Table hover striped>
                        <tbody>
                            {this.props.todos.map((todo) =>
                                <TodoTask getTodos={this.props.getTodos} editTodo={this.props.editTodo} todo={todo} />
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
                        <TodoTable getTodos={this.props.getTodos} editTodo={this.props.editTodo} todos={todoTables[p]} priority={p} />
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
            form: {}
        }
        if (this.props.todo) {
            state.form.text = this.props.todo.text;
            state.form.prev = this.props.todo.prev.join(',');
            state.form.dealline = this.props.todo.dealline;
        }

        this.state = state;
        this.clearForm = this.clearForm.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.onChangePrev = this.onChangePrev.bind(this);
        this.onChangeDeadline = this.onChangeDeadline.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentWillReceiveProps(nextprops) {
        var state = {
            form: {}
        }
        if (nextprops.todo) {
            state.form.text = nextprops.todo.text;
            state.form.prev = nextprops.todo.prevAlias.join(',');
            state.form.dealline = nextprops.todo.dealline;
        }
        this.setState(state);
    }
    clearForm() {
        var state = this.state;
        state.form.text = "";
        state.form.prev = "";
        state.form.dealline = "";
        state.todo = null;
        this.setState(state);
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
    onChangeDeadline(value) {
        var state = this.state;
        state.form.deadline = value;
        this.setState(state);
    }
    handleReset(e) {
        e.preventDefault();
        this.clearForm();
    }
    handleSubmit(e) {
        e.preventDefault();
        var form = this.state.form;
        var GetTodos = this.props.getTodos;
        var ClearForm = this.clearForm;
        if (this.props.todo && this.props.todo.id) {
            $.post('api/todos/' + this.props.todo.id, form)
                .done(function (data) {
                    ClearForm();
                    GetTodos(data);
                });

        } else {
            $.post('api/todos/', form)
                .done(function (data) {
                    ClearForm();
                    GetTodos(data);
                });
        }
    }
    render() {
        var todo = this.props.todo;
        var buttonText = todo ? "Update" : "Submit";
        return (
            <Row>
                <Col sm={3}></Col>
                <Col sm={6} className="TodoForm">
                    <Form horizontal onSubmit={this.handleSubmit}>
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
                            <DatePicker onChange={this.onChangeDeadline} value={this.state.form.deadline} />
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
        this.state = { todos: [], todo: null };
        this.GetTodos = this.GetTodos.bind(this);
        this.EditTodo = this.EditTodo.bind(this);
    }

    componentDidMount() {
        this.GetTodos();
    }

    GetTodos(data) {
        if (data) {
            this.setState({ todos: data, todo: null });
        }
        else {
            $.getJSON('api/todos')
                .then((data) => this.setState({ todos: data, todo: null }));
        }
    }
    EditTodo(data) {
        window.scrollTo(0, 0);
        this.setState({ todos: this.state.todos, todo: data });
    }
    render() {
        var aliases = [];
        this.state.todos.forEach(function (todo) {
            aliases.push(todo.alias);
        });
        return (
            <Row>
                <TodoForm getTodos={this.GetTodos} todo={this.state.todo} aliases={aliases} />
                <TodoList getTodos={this.GetTodos} editTodo={this.EditTodo} todos={this.state.todos} />
            </Row>
        );
    }
}
export default Todo;