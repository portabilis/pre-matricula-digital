<?php

namespace iEducar\Packages\PreMatricula\Providers;

use iEducar\Packages\PreMatricula\Console\Commands\AutoRejectSummonedPreRegistrations;
use iEducar\Packages\PreMatricula\Console\Commands\PrematriculaInstallCommand;
use iEducar\Packages\PreMatricula\Console\Commands\ProcessRecalculateGradeCommand;
use iEducar\Packages\PreMatricula\Console\Commands\ProcessRecalculatePriorityCommand;
use iEducar\Packages\PreMatricula\Events\PreRegistrationTransferEvent;
use iEducar\Packages\PreMatricula\Http\Controllers\AuthController;
use iEducar\Packages\PreMatricula\Http\Controllers\ConfigController;
use iEducar\Packages\PreMatricula\Http\Controllers\ExportController;
use iEducar\Packages\PreMatricula\Http\Controllers\ReportController;
use iEducar\Packages\PreMatricula\Listeners\PreRegistrationTransferNotificationListener;
use Illuminate\Auth\GenericUser;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Container\BindingResolutionException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider as LaravelServiceProvider;
use Illuminate\Support\Str;
use Nuwave\Lighthouse\WhereConditions\WhereConditionsServiceProvider;

class PreMatriculaServiceProvider extends LaravelServiceProvider
{
    /**
     * Register other services providers.
     *
     * @return void
     */
    public function register()
    {
        $this->app->register(GraphQLServiceProvider::class);
        $this->app->register(PreMatriculaEventServiceProvider::class);
    }

    /**
     * Boot service provider.
     *
     * @return void
     *
     * @throws BindingResolutionException
     */
    public function boot()
    {
        $this->loadTranslationsFrom(__DIR__ . '/../../resources/lang', 'prematricula');

        Route::middleware(['web'])->group(function () {
            Route::get('config/prematricula.js', ConfigController::class . '@config');

            Route::get('auth/check', AuthController::class . '@check');
            Route::get('auth/login', AuthController::class . '@login');

            Route::get('pre-matricula-export', ExportController::class . '@export');
            Route::get('pre-matricula-report', ReportController::class . '@preRegistrationReport');
        });

        if ($this->app->runningInConsole()) {
            $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');

            if (config('legacy.code')) {
                $this->loadLegacyMigration(); // @codeCoverageIgnore
            }

            $this->commands([
                PrematriculaInstallCommand::class,
                ProcessRecalculatePriorityCommand::class,
                ProcessRecalculateGradeCommand::class,
                AutoRejectSummonedPreRegistrations::class,
            ]);

            $this->publishes([
                __DIR__ . '/../../dist' => public_path('vendor/pre-matricula-digital'),
            ], 'pmd');
        }

        $this->loadViewsFrom(__DIR__ . '/../../resources/views', 'prematricula');

        $this->mergeConfigFrom(__DIR__ . '/../../config/prematricula.php', 'prematricula');

        $this->app->register(WhereConditionsServiceProvider::class);

        config([
            'auth.guards' => array_merge(
                config('auth.guards'),
                [
                    'prematricula' => [
                        'driver' => 'prematricula',
                    ],
                ],
            ),
        ]);

        Auth::viaRequest('prematricula', function (Request $request) {
            $token = config('prematricula.token');

            if (!empty($token) && hash_equals((string) $token, (string) $request->bearerToken())) {
                return new GenericUser([
                    'name' => 'Visitante',
                ]);
            }
        });

        Builder::macro('search', function ($columns, $value, $type = 'both') {
            $columns = is_string($columns) ? [$columns] : $columns;

            $operator = $this->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

            $search = "%{$value}%";

            $search = $type == 'left' ? "%{$value}" : $search;
            $search = $type == 'right' ? "{$value}%" : $search;

            return $this->where(function ($builder) use ($columns, $operator, $search) {
                foreach ($columns as $column) {
                    if (Str::contains($column, '.')) {
                        [$relation, $column] = explode('.', $column);

                        $builder->orWhereHas($relation, function ($builder) use ($column, $operator, $search) {
                            $builder->where($column, $operator, $search);
                        });
                    } else {
                        $builder->orWhere($column, $operator, $search);
                    }
                }
            });
        });

        Event::listen(PreRegistrationTransferEvent::class, PreRegistrationTransferNotificationListener::class);

        $this->callAfterResolving(Schedule::class, function (Schedule $schedule) {
            if ($this->app->runningInConsole()) {
                $schedule->command(AutoRejectSummonedPreRegistrations::class)->hourly();
            }
        });
    }

    /**
     * @codeCoverageIgnore
     */
    public function loadLegacyMigration(): void
    {
        $this->loadMigrationsFrom([
            __DIR__ . '/../../database/migrations/ieducar',
            __DIR__ . '/../../database/migrations/reports',
        ]);
    }
}
