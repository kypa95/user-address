package com.useraddress.user_address.helper.exception;

import java.util.Objects;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.useraddress.user_address.helper.response.ResponseHandler;
import com.useraddress.user_address.helper.response.ResponseWrapper;
import com.useraddress.user_address.util.Message;
import com.useraddress.user_address.util.enums.ErrorCode;

import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class ErrorHandler {


    /**
     * Handles all the exceptions thrown by us.
     *
     * @param exception: GeneralException
     * @return ResponseEntity<?> with the business code inside the envelope
     */
    @ExceptionHandler(GeneralException.class)
    public ResponseEntity<ResponseWrapper<Object>> generalExceptionHandler(GeneralException exception,
            HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                exception.getMessage(),
                exception.getMethod(),
                exception.getCode(),
                exception.getData(),
                request.getRequestURI());
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<ResponseWrapper<Object>> emptyResultDataAccessException(EmptyResultDataAccessException exception,
            HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                exception.getMessage(),
                HttpStatus.NOT_FOUND,
                ErrorCode.OBJECT_NOT_EXISTS.getValue(),
                null,
                request.getRequestURI());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ResponseWrapper<Object>> httpRequestMethodNotSupportedException(
            HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                Message.formatMessage(Message.METHOD_NOT_ALLOWED, exception.getMethod()),
                HttpStatus.METHOD_NOT_ALLOWED,
                HttpStatus.METHOD_NOT_ALLOWED.value(),
                null,
                request.getRequestURI());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ResponseWrapper<Object>> missingServletRequestParameterException(
            MissingServletRequestParameterException exception, HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                exception.getMessage(),
                HttpStatus.BAD_REQUEST,
                ErrorCode.MISSING_ARGUMENTS_IN_BODY.getValue(),
                null,
                request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ResponseWrapper<Object>> methodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException exception, HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                exception.getMessage(),
                HttpStatus.BAD_REQUEST,
                ErrorCode.DATA_TYPE_MISMATCH.getValue(),
                null,
                request.getRequestURI());
    }

    /**
     * Covers {@code MethodArgumentNotValidException} as well, it extends BindException.
     * Answers with the first field that failed the validation.
     *
     * @param exception: BindException
     * @return ResponseEntity<?>
     */
    @ExceptionHandler(BindException.class)
    protected ResponseEntity<ResponseWrapper<Object>> handleBindException(BindException exception,
            HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                Objects.requireNonNull(exception.getFieldError()).getField().concat(" ").concat(
                        Objects.requireNonNull(exception.getBindingResult().getAllErrors().get(0).getDefaultMessage())),
                HttpStatus.BAD_REQUEST,
                ErrorCode.INCOMPLETE_DATA.getValue(),
                null,
                request.getRequestURI());
    }

    /**
     * Prevents the errors in a JSON body when someone does a request.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    protected ResponseEntity<ResponseWrapper<Object>> httpMessageNotReadableException(
            HttpMessageNotReadableException exception, HttpServletRequest request) {
        String cause = exception.getCause() != null
                ? exception.getCause().getMessage().split(": ")[0]
                : exception.getMessage();

        return ResponseHandler.wrapFailureResponse(
                cause,
                HttpStatus.BAD_REQUEST,
                ErrorCode.MISSING_ARGUMENTS_IN_BODY.getValue(),
                null,
                request.getRequestURI());
    }

    /**
     * Unique constraints and foreign keys rejected by the database.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    protected ResponseEntity<ResponseWrapper<Object>> dataIntegrityViolationException(
            DataIntegrityViolationException exception, HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                Message.DUPLICATE_KEY_IN_DB,
                HttpStatus.CONFLICT,
                ErrorCode.JDBC_DUPLICATE_KEY.getValue(),
                null,
                request.getRequestURI());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    protected ResponseEntity<ResponseWrapper<Object>> illegalArgumentException(IllegalArgumentException exception,
            HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                exception.getMessage(),
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST.value(),
                null,
                request.getRequestURI());
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    protected ResponseEntity<ResponseWrapper<Object>> missingRequestHeaderException(MissingRequestHeaderException exception,
            HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                exception.getMessage(),
                HttpStatus.BAD_REQUEST,
                ErrorCode.MISSING_ARGUMENTS_IN_BODY.getValue(),
                null,
                request.getRequestURI());
    }

    /**
     * Spring exceptions that already carry their own status, such as an unknown route.
     * Handled here only to keep them inside the same envelope.
     */
    @ExceptionHandler(ErrorResponseException.class)
    protected ResponseEntity<ResponseWrapper<Object>> errorResponseException(ErrorResponseException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());

        return ResponseHandler.wrapFailureResponse(
                exception.getMessage(),
                status,
                status.value(),
                null,
                request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ResponseWrapper<Object>> unknownException(Exception exception, HttpServletRequest request) {
        return ResponseHandler.wrapFailureResponse(
                Message.UNKNOWN_ERROR,
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorCode.UNKNOWN_ERROR.getValue(),
                exception.getMessage(),
                request.getRequestURI());
    }
}
