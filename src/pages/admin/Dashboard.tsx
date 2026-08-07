import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CircleCheck,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  createUser,
  type AdminUserRole,
  type CreateUserRequest,
} from "@/services/adminService";

type UserFormValues = {
  firstName: string;
  lastName: string;
  officialEmail: string;
  password: string;
  departmentId: string;
  role: AdminUserRole;
};

type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

const emptyForm: UserFormValues = {
  firstName: "",
  lastName: "",
  officialEmail: "",
  password: "",
  departmentId: "",
  role: "ROLE_EMPLOYEE",
};

const roleOptions: Array<{
  value: AdminUserRole;
  label: string;
  description: string;
  icon: typeof ShieldCheck;
}> = [
  {
    value: "ROLE_ADMIN",
    label: "Admin",
    description: "System administration",
    icon: ShieldCheck,
  },
  {
    value: "ROLE_HR",
    label: "HR",
    description: "Manage workforce and talent",
    icon: UsersRound,
  },
  {
    value: "ROLE_MANAGER",
    label: "Manager",
    description: "Oversee teams and performance",
    icon: BriefcaseBusiness,
  },
  {
    value: "ROLE_EMPLOYEE",
    label: "Employee",
    description: "Access the employee workspace",
    icon: UserRound,
  },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = (values: UserFormValues): UserFormErrors => {
  const errors: UserFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Enter the user's first name.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Enter the user's last name.";
  }

  if (!values.officialEmail.trim()) {
    errors.officialEmail = "Enter an official email address.";
  } else if (!emailPattern.test(values.officialEmail.trim())) {
    errors.officialEmail = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter a temporary password.";
  } else if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  const departmentId = Number(values.departmentId);
  if (!values.departmentId.trim()) {
    errors.departmentId = "Enter a department ID.";
  } else if (!Number.isInteger(departmentId) || departmentId < 1) {
    errors.departmentId = "Use a positive whole-number department ID.";
  }

  return errors;
};

const Dashboard = () => {
  const [values, setValues] = useState<UserFormValues>(emptyForm);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState<{
    message: string;
    employeeCode?: string;
  } | null>(null);

  const updateField = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const field = name as keyof UserFormValues;

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError("");
    setSuccess(null);
  };

  const selectRole = (role: AdminUserRole) => {
    setValues((current) => ({ ...current, role }));
    setErrors((current) => ({ ...current, role: undefined }));
    setApiError("");
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess(null);
      return;
    }

    const payload: CreateUserRequest = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      officialEmail: values.officialEmail.trim(),
      password: values.password,
      departmentId: Number(values.departmentId),
      role: values.role,
    };

    setIsSubmitting(true);
    setApiError("");
    setSuccess(null);

    try {
      const response = await createUser(payload);

      setSuccess({
        message: response.message || "The organization account is ready to use.",
        employeeCode: response.employeeCode,
      });
      setValues({ ...emptyForm, role: values.role });
      setErrors({});
    } catch {
      setApiError(
        "We couldn't create this account. Check the details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f2ff] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.35fr)]">
        <aside className="relative hidden overflow-hidden bg-[#090d2e] px-10 py-11 text-white xl:flex xl:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_92%,rgba(120,43,255,.48),transparent_31%),radial-gradient(circle_at_88%_25%,rgba(111,51,255,.38),transparent_35%)]" />
          <div className="absolute -right-32 top-32 h-80 w-80 rounded-full border border-violet-400/30 bg-violet-500/10 shadow-[0_0_100px_30px_rgba(124,58,237,.2)]" />
          <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full border border-indigo-300/20" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="grid h-[4.2rem] w-[4.2rem] place-items-center rounded-[1.4rem] bg-gradient-to-br from-violet-500 to-violet-800 shadow-[0_14px_38px_rgba(109,40,217,.45)]">
              <Sparkles className="h-9 w-9" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">OKIP</p>
              <p className="mt-1 max-w-52 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-violet-100/75">
                Organizational Knowledge Gap Intelligence Platform
              </p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-md">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-700/55 px-4 py-2 text-xs font-semibold tracking-wide text-violet-50">
              <UserPlus className="h-4 w-4" />
              ORGANIZATION USER MANAGEMENT
            </div>
            <h1 className="text-5xl font-black leading-[1.04] tracking-tight">
              Grow your
              <span className="mt-2 block bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                workforce
              </span>
            </h1>
            <p className="mt-7 max-w-sm text-lg leading-8 text-slate-200/90">
              Create approved accounts for the people who move your organization
              forward.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-violet-100/80">Account status</p>
                <p className="mt-2 flex items-center gap-2 text-xl font-bold">
                  <CircleCheck className="h-5 w-5 text-emerald-300" /> Approved
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-violet-100/80">Access</p>
                <p className="mt-2 flex items-center gap-2 text-xl font-bold">
                  <ShieldCheck className="h-5 w-5 text-violet-200" /> Secured
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-5 text-sm text-violet-100/80">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> JWT protected
            </span>
            <span className="h-1 w-1 rounded-full bg-violet-200" />
            <span>Enterprise access</span>
          </div>
        </aside>

        <section className="flex items-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-7 flex items-center justify-between xl:hidden">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 text-white shadow-lg shadow-violet-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-black tracking-tight">OKIP</p>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Admin workspace
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
                Admin
              </span>
            </div>

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-violet-600">
                  <Sparkles className="h-4 w-4" /> Workforce intelligence
                </p>
                <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Create a new user
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                  New accounts are approved immediately and can sign in after
                  creation.
                </p>
              </div>
              <div className="hidden rounded-2xl border border-violet-100 bg-white px-4 py-3 text-right shadow-sm sm:block">
                <p className="text-xs font-medium text-slate-500">Admin access</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-violet-700">
                  <ShieldCheck className="h-4 w-4" /> Protected endpoint
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0_25px_65px_rgba(61,34,130,0.12)] sm:p-8">
              {success && (
                <div
                  className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
                  role="status"
                  aria-live="polite"
                >
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold">Account created</p>
                    <p className="mt-0.5 text-sm leading-5 text-emerald-800">
                      {success.message}
                      {success.employeeCode
                        ? ` Employee code: ${success.employeeCode}.`
                        : ""}
                    </p>
                  </div>
                </div>
              )}

              {apiError && (
                <div
                  className="mb-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-bold">Unable to create account</p>
                    <p className="mt-0.5 text-sm leading-5 text-rose-800">{apiError}</p>
                  </div>
                </div>
              )}

              <form noValidate onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="First name"
                    name="firstName"
                    placeholder="e.g. Ananya"
                    value={values.firstName}
                    onChange={updateField}
                    error={errors.firstName}
                    autoComplete="given-name"
                  />
                  <FormField
                    label="Last name"
                    name="lastName"
                    placeholder="e.g. Sharma"
                    value={values.lastName}
                    onChange={updateField}
                    error={errors.lastName}
                    autoComplete="family-name"
                  />
                  <FormField
                    label="Official email"
                    name="officialEmail"
                    placeholder="name@company.com"
                    value={values.officialEmail}
                    onChange={updateField}
                    error={errors.officialEmail}
                    autoComplete="email"
                    icon={<Mail className="h-4 w-4" />}
                    type="email"
                    className="sm:col-span-2"
                  />
                  <FormField
                    label="Temporary password"
                    name="password"
                    placeholder="Create a secure password"
                    value={values.password}
                    onChange={updateField}
                    error={errors.password}
                    autoComplete="new-password"
                    icon={<KeyRound className="h-4 w-4" />}
                    type="password"
                  />
                  <FormField
                    label="Department ID"
                    name="departmentId"
                    placeholder="e.g. 1"
                    value={values.departmentId}
                    onChange={updateField}
                    error={errors.departmentId}
                    icon={<Building2 className="h-4 w-4" />}
                    inputMode="numeric"
                    type="number"
                    min="1"
                    step="1"
                    hint="Use an initialized department ID."
                  />
                </div>

                <fieldset className="mt-7">
                  <legend className="text-sm font-bold text-slate-800">
                    Select user role
                  </legend>
                  <p className="mt-1 text-sm text-slate-500">
                    Assign the access level appropriate for this account.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      const selected = values.role === option.value;

                      return (
                        <label
                          className={`relative flex min-h-36 cursor-pointer flex-col rounded-2xl border p-4 transition-all duration-200 ${
                            selected
                              ? "border-violet-500 bg-violet-50 shadow-[0_8px_20px_rgba(124,58,237,.13)]"
                              : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                          }`}
                          key={option.value}
                        >
                          <input
                            checked={selected}
                            className="sr-only"
                            name="role"
                            onChange={() => selectRole(option.value)}
                            type="radio"
                            value={option.value}
                          />
                          <span
                            className={`grid h-9 w-9 place-items-center rounded-xl ${
                              selected
                                ? "bg-violet-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="mt-3 text-sm font-bold text-slate-900">
                            {option.label}
                          </span>
                          <span className="mt-1 text-xs leading-4 text-slate-500">
                            {option.description}
                          </span>
                          {selected && (
                            <CircleCheck className="absolute right-3 top-3 h-4 w-4 text-violet-600" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <button
                  className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-700 via-violet-600 to-purple-600 px-6 text-base font-bold text-white shadow-[0_15px_28px_rgba(109,40,217,.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(109,40,217,.34)] focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-70"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create organization user <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-medium tracking-wide text-slate-500">
                <ShieldCheck className="h-4 w-4 text-violet-600" />
                This request is sent with your secured administrator session.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

type FormFieldProps = {
  label: string;
  name: keyof Pick<
    UserFormValues,
    "firstName" | "lastName" | "officialEmail" | "password" | "departmentId"
  >;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  type?: "email" | "number" | "password" | "text";
  inputMode?: "numeric";
  min?: string;
  step?: string;
  hint?: string;
  className?: string;
};

const FormField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  icon,
  type = "text",
  inputMode,
  min,
  step,
  hint,
  className = "",
}: FormFieldProps) => {
  const inputId = `admin-user-${name}`;
  const feedbackId = `${inputId}-feedback`;

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
            {icon}
          </span>
        )}
        <input
          aria-describedby={error || hint ? feedbackId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={`h-12 w-full rounded-xl border bg-white py-3 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
            icon ? "pl-11" : "pl-4"
          } ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-slate-200 focus:border-violet-500 focus:ring-violet-100"
          }`}
          id={inputId}
          inputMode={inputMode}
          min={min}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          type={type}
          value={value}
        />
      </div>
      {(error || hint) && (
        <p
          className={`mt-1.5 text-xs ${error ? "text-rose-600" : "text-slate-500"}`}
          id={feedbackId}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
};

export default Dashboard;
