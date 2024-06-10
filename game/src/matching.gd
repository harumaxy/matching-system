extends Node
class_name Matching

const WAIT = 5

@onready var client := $HTTPRequest



func _ready() -> void:
  client.request_completed.connect(func(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray):
    print(response_code)
  )
  
  while true:
    client.request("http://127.0.0.1:8000/subscribe/12345", [], HTTPClient.METHOD_GET)
    await get_tree().create_timer(WAIT).timeout
