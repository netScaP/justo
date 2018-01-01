/*let mainData = undefined;

fetch('../mainData.json')  
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.log('Looks like there was a problem. Status Code: ' +  
          response.status);  
        return;  
      }

      // Examine the text in the response  
      response.json().then(function(data) {  
        console.log(data);
        mainData = data;
        new Vue({
          el: '.orders',
          data: {
              mainData
          },
          delimiters: ['${', '}']
        });  
      });  
    }  
  )  
  .catch(function(err) {  
    console.log('Fetch Error :-S', err);  
  });
*/

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
  delimiters: ['[[', ']]'],
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
    nextTodoId: 4,
    mainData: [],
    endpoint: '../mainData.json'
  },
  methods: {
    addNewTodo: function () {
      this.todos.push({
        id: this.nextTodoId++,
        title: this.newTodoText
      })
      this.newTodoText = ''
    },
    getAllPosts: function() {
      var vm = this;
      $.getJSON('../mainData.json', function(data) {
        console.log(data);
        console.log(data[0]['orderText']);
        vm.mainData = data;
      });
    }
  },
  created: function() {
    this.getAllPosts()
  }
});



