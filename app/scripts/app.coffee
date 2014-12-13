class App
  sayHello: (name) ->
    console.info("Hello from #{name}!")

app = new App()
app.sayHello("gulp-bsc")