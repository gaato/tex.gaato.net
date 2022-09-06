package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os/exec"
	"strings"
)

type RequestStruct struct {
	Type  string `json:"type"`
	Plain bool   `json:"plain"`
	Code  string `json:"code"`
}

type ResponseStruct struct {
	Status int    `json:"status"`
	Result string `json:"result"`
	Error  string `json:"error"`
}

func handlerFunc(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	body, e := ioutil.ReadAll(r.Body)
	if e != nil {
		fmt.Println(e)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var req RequestStruct
	e = json.Unmarshal(body, &req)
	if e != nil {
		fmt.Println(e)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	fmt.Println(req)
	var cmd *exec.Cmd
	switch req.Type {
	case "pdf":
		cmd = exec.Command("docker", "run", "--rm", "-i", "tex", "texpdf.py")
	case "png":
		if req.Plain {
			cmd = exec.Command("docker", "run", "--rm", "-i", "tex", "tex.py", "-p")
		} else {
			cmd = exec.Command("docker", "run", "--rm", "-i", "tex", "tex.py")
		}
	default:
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid type"))
		return
	}
	cmd.Stdin = strings.NewReader(req.Code)
	out, e := cmd.Output()
	if e != nil {
		fmt.Println(e)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	var res ResponseStruct
	switch cmd.ProcessState.ExitCode() {
	case 0:
		res.Status = 0
		res.Result = string(out)
	case 1:
		res.Status = 1
		res.Error = string(out)
	case 2:
		res.Status = 2
		res.Error = "timeout"
	default:
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(res)
}

func main() {
	http.HandleFunc("/", handlerFunc)
	log.Fatal(http.ListenAndServe(":9000", nil))
}
