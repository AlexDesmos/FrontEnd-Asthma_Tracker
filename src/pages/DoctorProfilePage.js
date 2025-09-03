import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import '../css/DoctorProfilePage.css';

const EMAIL_PATTERN = /.+@.+\..+/;
const PHONE_PATTERN = /^\+7\d{10}$/;

function DoctorProfilePage({ personnelNumber, onLogout }) {
    const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [regOpen, setRegOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');

    const emptyForm = {
        name: '',
        surname: '',
        patronymic: '',
        sex: 'муж',
        birthday: '',
        email: '',
        phone_number: '+7',
        oms: '',
        height: '',
    };
    const [form, setForm] = useState(emptyForm);

    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        if (!personnelNumber) return;
        const fetchDoctor = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`${API_URL}/doctors/doctor?personnel_number=${encodeURIComponent(personnelNumber)}`);
                if (!res.ok) throw new Error('Ошибка при получении профиля врача');
                const data = await res.json();
                setDoctor(data);
            } catch (err) {
                setError(err.message || 'Ошибка загрузки профиля');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [personnelNumber, API_URL]);

    const initials = useMemo(() => {
        if (!doctor) return '';
        const n = (doctor.name || '').trim();
        const s = (doctor.surname || '').trim();
        return `${n.charAt(0)}${s.charAt(0)}`.toUpperCase();
    }, [doctor]);

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const applyDateMask = (input) => {
        const nowYear = new Date().getFullYear();
        const digits = (input || '').replace(/\D/g, '').slice(0, 8);

        const ddRaw = digits.slice(0, 2);
        const mmRaw = digits.slice(2, 4);
        const yyyyRaw = digits.slice(4, 8);

        let dd = ddRaw;
        if (ddRaw.length === 2) {
            const n = clamp(parseInt(ddRaw, 10) || 0, 1, 31);
            dd = String(n).padStart(2, '0');
        }

        let mm = mmRaw;
        if (mmRaw.length === 2) {
            const n = clamp(parseInt(mmRaw, 10) || 0, 1, 12);
            mm = String(n).padStart(2, '0');
        }

        let yyyy = yyyyRaw;
        if (yyyyRaw.length === 4) {
            let n = parseInt(yyyyRaw, 10) || 0;
            if (n < 1900) n = 1900;
            if (n > nowYear) n = nowYear;
            yyyy = String(n);
        }

        if (digits.length <= 2) return dd;
        if (digits.length <= 4) return `${dd}.${mm}`;
        return `${dd}.${mm}.${yyyy}`;
    };

    const isValidDateDMY = (s) => {
        const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((s || '').trim());
        if (!m) return false;
        const dd = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const yyyy = parseInt(m[3], 10);
        if (mm < 1 || mm > 12) return false;
        const daysInMonth = new Date(yyyy, mm, 0).getDate();
        if (dd < 1 || dd > daysInMonth) return false;
        if (yyyy < 1900 || yyyy > new Date().getFullYear()) return false;
        return true;
    };

    const toISODate = (s) => {
        const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((s || '').trim());
        if (!m) return '';
        const [, dd, mm, yyyy] = m;
        return `${yyyy}-${mm}-${dd}`;
    };

    const applyPhoneMask = (input) => {
        let digits = (input || '').replace(/\D/g, '');
        if (digits.startsWith('7') || digits.startsWith('8')) {
            digits = digits.slice(1);
        }
        digits = digits.slice(0, 10);
        return `+7${digits}`;
    };

    const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const onChangeSurname = (e) => setField('surname', e.target.value);
    const onChangeName = (e) => setField('name', e.target.value);
    const onChangePatronymic = (e) => setField('patronymic', e.target.value);
    const onChangeSex = (e) => setField('sex', e.target.value);
    const onChangeEmail = (e) => setField('email', e.target.value);

    const onChangePhone = (e) => setField('phone_number', applyPhoneMask(e.target.value));
    const onFocusPhone = () => {
        if (!form.phone_number || form.phone_number === '') {
            setField('phone_number', '+7');
        }
    };
    const onBlurPhone = () => setField('phone_number', applyPhoneMask(form.phone_number));

    const onChangeBirthday = (e) => setField('birthday', applyDateMask(e.target.value));
    const onBlurBirthday = () => setField('birthday', applyDateMask(form.birthday));

    const onChangeOms = (e) => setField('oms', (e.target.value || '').replace(/\D/g, '').slice(0, 16));

    const onChangeHeight = (e) => setField('height', (e.target.value || '').replace(/[^\d]/g, '').slice(0, 3));

    const errors = useMemo(() => {
        const errs = {};
        if (!form.surname.trim()) errs.surname = 'Укажите фамилию';
        if (!form.name.trim()) errs.name = 'Укажите имя';
        if (!form.patronymic.trim()) errs.patronymic = 'Укажите отчество';
        if (!form.sex) errs.sex = 'Укажите пол';

        if (!form.birthday.trim()) errs.birthday = 'Укажите дату рождения';
        else if (!isValidDateDMY(form.birthday)) errs.birthday = 'Неверная дата';

        if (!form.email.trim()) errs.email = 'Укажите email';
        else if (!EMAIL_PATTERN.test(form.email)) errs.email = 'Некорректный email';

        if (!PHONE_PATTERN.test(form.phone_number || '')) {
            errs.phone_number = 'Телефон должен быть в формате +7XXXXXXXXXX';
        }

        if (form.oms.length !== 16) errs.oms = 'ОМС должен содержать 16 цифр';

        if (form.height === '') errs.height = 'Укажите рост';
        else {
            const h = parseInt(form.height, 10);
            if (!Number.isFinite(h)) errs.height = 'Рост должен быть целым числом';
            else if (h < 30 || h > 250) errs.height = 'Рост должен быть в диапазоне 30–250 см';
        }

        return errs;
    }, [form]);

    const isInvalid = (field) => submitAttempted && Boolean(errors[field]);

    const openReg = () => {
        setSaveError('');
        setSaveSuccess('');
        setForm(emptyForm);
        setSubmitAttempted(false);
        setRegOpen(true);
    };
    const closeReg = () => { if (!saving) setRegOpen(false); };

    const handleBack = () => closeReg();

    const handleCreate = async () => {
        setSubmitAttempted(true);

        if (Object.keys(errors).length > 0) {
            setSaveError('Заполните все поля корректно');
            setSaveSuccess('');
            return;
        }

        setSaveError('');
        setSaveSuccess('');
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                surname: form.surname.trim(),
                patronymic: form.patronymic.trim(),
                birthday: toISODate(form.birthday),
                email: form.email.trim(),
                phone_number: form.phone_number.trim(),
                oms: form.oms.trim(),
                sex: form.sex,
                height: parseInt(form.height, 10),
            };

            const resp = await fetch(`${API_URL}/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                let msg = 'Не удалось создать пациента';
                try { const txt = await resp.text(); if (txt) msg = txt; } catch { }
                throw new Error(msg);
            }

            setSaveSuccess('Пациент успешно создан');
            setTimeout(() => setRegOpen(false), 1200);
        } catch (e) {
            setSaveError(e.message || 'Ошибка создания пациента');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!regOpen) return;

        const onKey = (e) => {
            if (e.key === 'Escape' && !saving) {
                setRegOpen(false);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [regOpen, saving]);


    return (
        <>
            <Header />

            <div className="dp-container">
                <div className="dp-header">
                    <div className="dp-avatar">{initials}</div>
                    <h2 className="dp-title">Профиль врача</h2>
                    <button className="btn btn-green" onClick={openReg}>Регистрация пациента</button>
                </div>

                {loading && <p className="dp-info">Загрузка…</p>}
                {error && <p className="dp-info dp-error">{error}</p>}

                {doctor && (
                    <div className="dp-card">
                        <Info label="👤 ФИО" value={`${doctor.surname || ''} ${doctor.name || ''}`.trim()} />
                        <Info label="💳 Табельный №" value={doctor.personnel_number} />
                    </div>
                )}

                <div className="dp-logout-wrap">
                    <button className="btn btn-red dp-logout" onClick={onLogout}>Выйти</button>
                </div>
            </div>

            {/* Модалка регистрации пациента */}
            {regOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeReg}>
                    <div className="modal modal-form" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">Регистрация пациента</div>

                        <div className="form-grid">
                            <Field label="Фамилия" error={isInvalid('surname') ? errors.surname : ''}>
                                <input
                                    className={`input ${isInvalid('surname') ? 'invalid' : ''}`}
                                    value={form.surname}
                                    onChange={onChangeSurname}
                                    placeholder="Петров"
                                />
                            </Field>

                            <Field label="Имя" error={isInvalid('name') ? errors.name : ''}>
                                <input
                                    className={`input ${isInvalid('name') ? 'invalid' : ''}`}
                                    value={form.name}
                                    onChange={onChangeName}
                                    placeholder="Пётр"
                                />
                            </Field>

                            <Field label="Отчество" error={isInvalid('patronymic') ? errors.patronymic : ''}>
                                <input
                                    className={`input ${isInvalid('patronymic') ? 'invalid' : ''}`}
                                    value={form.patronymic}
                                    onChange={onChangePatronymic}
                                    placeholder="Петрович"
                                />
                            </Field>

                            <Field label="Пол" error={isInvalid('sex') ? errors.sex : ''}>
                                <select
                                    className={`input ${isInvalid('sex') ? 'invalid' : ''}`}
                                    value={form.sex}
                                    onChange={onChangeSex}
                                >
                                    <option value="муж">муж</option>
                                    <option value="жен">жен</option>
                                </select>
                            </Field>

                            <Field label="Дата рождения (ДД.ММ.ГГГГ)" error={isInvalid('birthday') ? errors.birthday : ''}>
                                <input
                                    className={`input ${isInvalid('birthday') ? 'invalid' : ''}`}
                                    value={form.birthday}
                                    onChange={onChangeBirthday}
                                    onBlur={onBlurBirthday}
                                    placeholder="01.02.1996"
                                    inputMode="numeric"
                                />
                            </Field>

                            <Field label="Email" error={isInvalid('email') ? errors.email : ''}>
                                <input
                                    type="email"
                                    className={`input ${isInvalid('email') ? 'invalid' : ''}`}
                                    value={form.email}
                                    onChange={onChangeEmail}
                                    placeholder="petrov@mail.ru"
                                />
                            </Field>

                            <Field label="Телефон (+7 и 10 цифр)" error={isInvalid('phone_number') ? errors.phone_number : ''}>
                                <input
                                    className={`input ${isInvalid('phone_number') ? 'invalid' : ''}`}
                                    value={form.phone_number}
                                    onChange={onChangePhone}
                                    onFocus={onFocusPhone}
                                    onBlur={onBlurPhone}
                                    placeholder="+7XXXXXXXXXX"
                                    inputMode="tel"
                                />
                            </Field>

                            <Field label="ОМС (16 цифр)" error={isInvalid('oms') ? errors.oms : ''}>
                                <input
                                    className={`input ${isInvalid('oms') ? 'invalid' : ''}`}
                                    value={form.oms}
                                    onChange={onChangeOms}
                                    placeholder="1234567898765434"
                                    inputMode="numeric"
                                />
                            </Field>

                            <Field label="Рост (см)" error={isInvalid('height') ? errors.height : ''}>
                                <input
                                    className={`input ${isInvalid('height') ? 'invalid' : ''}`}
                                    value={form.height}
                                    onChange={onChangeHeight}
                                    placeholder="175"
                                    inputMode="numeric"
                                />
                            </Field>
                        </div>

                        {saveError && <div className="form-msg error">{saveError}</div>}
                        {saveSuccess && <div className="form-msg success">{saveSuccess}</div>}

                        <div className="modal-actions">
                            <button className="btn btn-gray" onClick={handleBack} disabled={saving}>Назад</button>
                            <button className="btn btn-green" onClick={handleCreate} disabled={saving}>
                                {saving ? 'Создание…' : 'Создать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function Info({ label, value }) {
    return (
        <div className="info-row">
            <div className="info-label">{label}</div>
            <div className="info-value">{value || '—'}</div>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="field">
            <span className="field-label">{label}</span>
            {children}
            {error ? <span className="field-error">{error}</span> : null}
        </label>
    );
}

export default DoctorProfilePage;
