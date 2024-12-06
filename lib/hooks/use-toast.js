// lib/hooks/use-toast.js
import * as React from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === toastId ? { ...toast, open: false } : toast
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId),
      }
    
    default:
      return state
  }
}

const listeners = []

let state = { toasts: [] }

function dispatch(action) {
  state = reducer(state, action)
  listeners.forEach((listener) => {
    listener(state)
  })
}

function toast(props) {
  const id = genId()

  const update = (updateProps) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...updateProps, id },
    })

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [localState, setLocalState] = React.useState(state)

  React.useEffect(() => {
    const handleStateUpdate = (newState) => {
      setLocalState(newState)
    }

    listeners.push(handleStateUpdate)
    return () => {
      const index = listeners.indexOf(handleStateUpdate)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...localState,
    toast,
    dismiss: (toastId) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

// Optional: Create a standalone toast function
function createToast(props) {
  return toast(props)
}

export { useToast, createToast as toast }