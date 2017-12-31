Vue.component('todo-item', {
  template: '\
    <li>\
      {{ title }}\
      <button v-on:click="$emit(\'remove\')">-</button>\
    </li>\
  ',
  props: ['title']
});
new Vue({
  el: '#main',
  data: {
    newTodoText: '',
    todos: [
      {
        id: 1,
        title: 'JavaScript'
      },
      {
        id: 2,
        title: 'PHP'
      },
      {
        id: 3,
        title: 'Python'
      }
    ],
    nextTodoId: 4
  },
  methods: {
    addNewTodo: function () {
      this.todos.push({
        id: this.nextTodoId++,
        title: this.newTodoText
      })
      this.newTodoText = ''
    }
  }
});

