import { Todo } from 'src/apiClient';
import { StateInterface } from 'src/store';

export function updateTodo(state: StateInterface, todo: Todo) {
  const itemIndex = state.todos.findIndex((item: Todo) => item.id == todo.id);
  state.todos.splice(itemIndex, 1, todo);
}

export function addTodo(state: StateInterface, todo: Todo) {
  state.todos.push(todo);
}

export function deleteTodo(state: StateInterface, id: string) {
  const itemIdx = state.todos.findIndex((item: Todo) => item.id == id);
  state.todos.splice(itemIdx, 1);
}

export function loadTodos(state: StateInterface, todos: Todo[]) {
  state.todos.splice(0);
  state.todos.push(...todos);
}
