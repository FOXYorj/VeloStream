package main

import (
	"syscall"
	"unsafe"
)

var (
	user32           = syscall.NewLazyDLL("user32.dll")
	procSetCursorPos = user32.NewProc("SetCursorPos")
	procGetCursorPos = user32.NewProc("GetCursorPos")
	procMouseEvent   = user32.NewProc("mouse_event")
	procKeybdEvent   = user32.NewProc("keybd_event")
	procGetSMValue   = user32.NewProc("GetSystemMetrics")
)

// mouse_event flags
const (
	MOUSEEVENTF_MOVE        = 0x0001
	MOUSEEVENTF_LEFTDOWN    = 0x0002
	MOUSEEVENTF_LEFTUP      = 0x0004
	MOUSEEVENTF_RIGHTDOWN   = 0x0008
	MOUSEEVENTF_RIGHTUP     = 0x0010
	MOUSEEVENTF_MIDDLEDOWN  = 0x0020
	MOUSEEVENTF_MIDDLEUP    = 0x0040
	MOUSEEVENTF_WHEEL       = 0x0800
	MOUSEEVENTF_ABSOLUTE    = 0x8000

	SM_CXSCREEN = 0
	SM_CYSCREEN = 1

	KEYEVENTF_EXTENDEDKEY = 0x0001
	KEYEVENTF_KEYUP       = 0x0002
)

type POINT struct {
	X, Y int32
}

// RemoteInput describes the incoming remote control message payload
type RemoteInput struct {
	Action  string  `json:"action"`  // "move", "left_click", "right_click", "middle_click", "scroll", "key_down", "key_up", "type"
	DX      float64 `json:"dx"`      // relative mouse delta X
	DY      float64 `json:"dy"`      // relative mouse delta Y
	Scroll  float64 `json:"scroll"`  // scroll delta
	KeyCode int     `json:"keyCode"` // virtual key code
	Text    string  `json:"text"`    // text to type
}

func getScreenSize() (int32, int32) {
	w, _, _ := procGetSMValue.Call(uintptr(SM_CXSCREEN))
	h, _, _ := procGetSMValue.Call(uintptr(SM_CYSCREEN))
	return int32(w), int32(h)
}

func getCursorPos() (int32, int32) {
	var pt POINT
	procGetCursorPos.Call(uintptr(unsafe.Pointer(&pt)))
	return pt.X, pt.Y
}

func moveMouse(dx, dy float64) {
	cx, cy := getCursorPos()
	nx := cx + int32(dx)
	ny := cy + int32(dy)

	// Clamp to screen bounds
	sw, sh := getScreenSize()
	if nx < 0 { nx = 0 }
	if ny < 0 { ny = 0 }
	if nx > sw { nx = sw }
	if ny > sh { ny = sh }

	procSetCursorPos.Call(uintptr(nx), uintptr(ny))
}

func mouseLeftClick() {
	procMouseEvent.Call(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
	procMouseEvent.Call(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
}

func mouseRightClick() {
	procMouseEvent.Call(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0)
	procMouseEvent.Call(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)
}

func mouseMiddleClick() {
	procMouseEvent.Call(MOUSEEVENTF_MIDDLEDOWN, 0, 0, 0, 0)
	procMouseEvent.Call(MOUSEEVENTF_MIDDLEUP, 0, 0, 0, 0)
}

func mouseScroll(delta float64) {
	// Positive = up, negative = down. Windows expects WHEEL_DELTA = 120 per notch
	amount := int32(delta * 120)
	procMouseEvent.Call(MOUSEEVENTF_WHEEL, 0, 0, uintptr(uint32(amount)), 0)
}

func sendKey(vkCode int, keyUp bool) {
	flags := uintptr(0)
	if keyUp {
		flags = KEYEVENTF_KEYUP
	}
	procKeybdEvent.Call(uintptr(vkCode), 0, flags, 0)
}

func handleRemoteInput(ri RemoteInput) {
	switch ri.Action {
	case "move":
		moveMouse(ri.DX, ri.DY)
	case "left_click":
		mouseLeftClick()
	case "right_click":
		mouseRightClick()
	case "middle_click":
		mouseMiddleClick()
	case "scroll":
		mouseScroll(ri.Scroll)
	case "key_down":
		sendKey(ri.KeyCode, false)
	case "key_up":
		sendKey(ri.KeyCode, true)
	}
}
