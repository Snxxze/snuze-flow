package apperrors

import "errors"

var (
	ErrNotFound     = errors.New("resource not found")
	ErrUnauthorized = errors.New("unauthorized access")
	ErrForbidden    = errors.New("forbidden access")
	ErrBadRequest   = errors.New("invalid input request")
	ErrConflict     = errors.New("resource already exists")
	ErrInternal     = errors.New("internal server error")
)

type AppError struct {
	Code    string       `json:"code"`
	Message string       `json:"message"`
	Err     error        `json:"-"`
	Details []FieldError `json:"details,omitempty"`
}

type FieldError struct {
	Field string `json:"field"`
	Issue string `json:"issue"`
}

func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Code
}

func NewAppError(code, message string, err error) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}
