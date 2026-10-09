@php
    $preRegistrationUrl = \iEducar\Packages\PreMatricula\Support\OpenPreRegistration::url();
@endphp
@if(!empty($preRegistrationUrl))
    <a class="pre-registration" href="{{ $preRegistrationUrl }}">
        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
        Pré-matrícula
    </a>
@endif
