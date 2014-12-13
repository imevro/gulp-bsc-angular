App =
  generatorName: "gulp-bsc"

  sayHello: (name) ->
    console.info("Hello from #{name}!")

  init: ->
    @.sayHello(@.generatorName)

App.init()