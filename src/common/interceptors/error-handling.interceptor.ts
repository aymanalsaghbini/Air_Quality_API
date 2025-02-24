import {
  CallHandler,
  HttpException,
  Injectable,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const response: Response = httpContext.getResponse();

    return next.handle().pipe(
      catchError((error) => {
        // If the error is an instance of HttpException (or derived from it)
        if (error instanceof HttpException) {
          const status = error.getStatus();
          const responseBody: any = error.getResponse();
          const errorMessage =
            typeof responseBody === 'string' ? responseBody : responseBody.message;

          // Handle specific status codes and exceptions if needed
          switch (status) {
            case 400:
              // BadRequestException
              response.status(400).json({
                statusCode: 400,
                message: errorMessage || 'Bad Request',
                error: 'BadRequestException',
              });
              break;

            case 401:
              // UnauthorizedException
              response.status(401).json({
                statusCode: 401,
                message: errorMessage || 'Unauthorized',
                error: 'UnauthorizedException',
              });
              break;

            case 403:
              // ForbiddenException
              response.status(403).json({
                statusCode: 403,
                message: errorMessage || 'Forbidden',
                error: 'ForbiddenException',
              });
              break;

            case 404:
              // NotFoundException
              response.status(404).json({
                statusCode: 404,
                message: errorMessage || 'Not Found',
                error: 'NotFoundException',
              });
              break;

            case 500:
            default:
              // InternalServerErrorException or any other exception
              response.status(500).json({
                statusCode: 500,
                message: errorMessage || 'Internal Server Error',
                error: 'InternalServerErrorException',
              });
              break;
          }

          // After handling the error, return an observable with an empty response
          return throwError(() => new Error('Error handled'));
        }

        // For unknown errors, return a generic error message
        response.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
          error: 'UnknownError',
        });

        return throwError(() => new Error('Unknown error'));
      }),
    );
  }
}
