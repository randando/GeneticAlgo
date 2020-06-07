var mod = {
  data: function() {
    return {
      rem: 0
    }
  },
  props: {
    title: String,
    value: Number,
  },
  template: `
    <div>
      <h6>
        {{title}} :
        <span>
          {{value}}
          <a class="btn-flat btn-small waves-effect waves-light" @click="inc(title)"><i class="material-icons">add</i></a>
          <a class="btn-flat btn-small waves-effect waves-light" @click="dec(title)"><i class="material-icons">remove</i></a>
        </span>
      </h6>
    </div>
  `,
  methods:{
    inc,
    dec
  }
}

var editable = {
  data: function(){
    return{

    }
  },
  props:{
    title: String,
    value: Number
  },
  template:`
    <div>
      <h6>{{title}}:
      <span>{{value}}
        <a class="btn-floating btn-small waves-effect waves-light" @click="edit()"><i class="material-icons">edit</i></a>
      </span>
      </h6>
    </div>
  `,
  methods:{
    edit: ()=>{
      let new_pop = prompt("Enter Population Size (Max. 500)")
      if(new_pop <= app.population.limit){
        app.population.val = Number(new_pop)
        resetSketch(new_pop)
      }
    }
  }
}

const app = new Vue({
  el: '#app',
  data:{
    foo: [
      { title: 'Generations', val: 5, step: 5, limit: 500},
      { title: 'Mutation Rate', val: 0.02, step: 0.01, limit: 1 },
      { title: 'Crossover Rate', val: 0.73, step: 0.01, limit: 1 }
    ],
    population: {title:'Population Size', val: 50, limit: 500}
  },
  components: {
    'mod': mod,
    'editable': editable
  }
})
