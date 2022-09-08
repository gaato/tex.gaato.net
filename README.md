# tex.gaato.net

Web API for LaTeX

```
$ docker build -t tex ./container # takes a lot of time
$ go run main.go
```

## POST /api

### Request

```
{
    "type": Union["png", "pdf"],
    "plain": bool,
    "code": string
}
```

### Response

```
{
    "status": int,
    "result": string,
    "error": string
}
 ```
 
 ### status
 
 - 0: Success
 - 1: Rendering error
 - 2: Timeout
 
 ### result
 
 Result is encoded in base64.
 
