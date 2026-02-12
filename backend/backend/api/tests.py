import uuid
from datetime import datetime
from decimal import Decimal
from unittest.mock import patch, MagicMock

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from backend.api.models.school import School
from backend.api.models.parent import Parent
from backend.api.models.student import Student
from backend.api.models.field_trip import FieldTrip, FieldTripRegistration
from backend.api.models.transaction import Transaction
from backend.api.serializers import FieldTripSerializer, FieldTripPaymentSerializer
from backend.legacy_api import LegacyPaymentProcessor, PaymentResponse


# ---------------------------------------------------------------------------
# Model Tests
# ---------------------------------------------------------------------------

class SchoolModelTests(TestCase):
    def test_str_returns_name(self):
        school = School.objects.create(name="Springfield Elementary")
        self.assertEqual(str(school), "Springfield Elementary")

    def test_id_is_uuid(self):
        school = School.objects.create(name="Test School")
        self.assertIsInstance(school.id, uuid.UUID)

    def test_id_auto_generated(self):
        school = School.objects.create(name="School A")
        self.assertIsNotNone(school.id)

    def test_unique_ids(self):
        s1 = School.objects.create(name="School A")
        s2 = School.objects.create(name="School B")
        self.assertNotEqual(s1.id, s2.id)


class ParentModelTests(TestCase):
    def test_str_returns_full_name(self):
        parent = Parent.objects.create(
            first_name="Homer", last_name="Simpson", email="homer@example.com"
        )
        self.assertEqual(str(parent), "Homer Simpson")

    def test_auto_id(self):
        parent = Parent.objects.create(
            first_name="Marge", last_name="Simpson", email="marge@example.com"
        )
        self.assertIsNotNone(parent.id)
        self.assertIsInstance(parent.id, int)


class StudentModelTests(TestCase):
    def setUp(self):
        self.school = School.objects.create(name="Springfield Elementary")
        self.parent = Parent.objects.create(
            first_name="Homer", last_name="Simpson", email="homer@example.com"
        )

    def test_str_returns_full_name(self):
        student = Student.objects.create(
            first_name="Bart", last_name="Simpson",
            parent=self.parent, school=self.school,
        )
        self.assertEqual(str(student), "Bart Simpson")

    def test_parent_relationship(self):
        student = Student.objects.create(
            first_name="Bart", last_name="Simpson",
            parent=self.parent, school=self.school,
        )
        self.assertIn(student, self.parent.children.all())

    def test_school_relationship(self):
        student = Student.objects.create(
            first_name="Bart", last_name="Simpson",
            parent=self.parent, school=self.school,
        )
        self.assertIn(student, self.school.students.all())

    def test_cascade_delete_school_deletes_student(self):
        Student.objects.create(
            first_name="Bart", last_name="Simpson",
            parent=self.parent, school=self.school,
        )
        self.school.delete()
        self.assertEqual(Student.objects.count(), 0)

    def test_protect_delete_parent_raises(self):
        Student.objects.create(
            first_name="Bart", last_name="Simpson",
            parent=self.parent, school=self.school,
        )
        from django.db.models import ProtectedError
        with self.assertRaises(ProtectedError):
            self.parent.delete()


class FieldTripModelTests(TestCase):
    def test_id_is_uuid(self):
        trip = FieldTrip.objects.create(
            location="Museum", cost=25.50, date=timezone.now()
        )
        self.assertIsInstance(trip.id, uuid.UUID)

    def test_fields_stored(self):
        now = timezone.now()
        trip = FieldTrip.objects.create(location="Zoo", cost=15.00, date=now)
        trip.refresh_from_db()
        self.assertEqual(trip.location, "Zoo")
        self.assertAlmostEqual(trip.cost, 15.00)


class FieldTripRegistrationModelTests(TestCase):
    def setUp(self):
        self.school = School.objects.create(name="Test School")
        self.parent = Parent.objects.create(
            first_name="Jane", last_name="Doe", email="jane@example.com"
        )
        self.student = Student.objects.create(
            first_name="John", last_name="Doe",
            parent=self.parent, school=self.school,
        )
        self.trip = FieldTrip.objects.create(
            location="Aquarium", cost=20.00, date=timezone.now()
        )

    def test_create_registration(self):
        reg = FieldTripRegistration.objects.create(
            student=self.student, field_trip=self.trip,
        )
        self.assertEqual(reg.student, self.student)
        self.assertEqual(reg.field_trip, self.trip)

    def test_cascade_delete_field_trip(self):
        FieldTripRegistration.objects.create(
            student=self.student, field_trip=self.trip,
        )
        self.trip.delete()
        self.assertEqual(FieldTripRegistration.objects.count(), 0)

    def test_cascade_delete_student(self):
        FieldTripRegistration.objects.create(
            student=self.student, field_trip=self.trip,
        )
        self.student.delete()
        self.assertEqual(FieldTripRegistration.objects.count(), 0)


class TransactionModelTests(TestCase):
    def setUp(self):
        self.school = School.objects.create(name="Test School")
        self.parent = Parent.objects.create(
            first_name="Jane", last_name="Doe", email="jane@example.com"
        )
        self.student = Student.objects.create(
            first_name="John", last_name="Doe",
            parent=self.parent, school=self.school,
        )
        self.trip = FieldTrip.objects.create(
            location="Zoo", cost=30.00, date=timezone.now()
        )

    def test_create_transaction(self):
        tx = Transaction.objects.create(
            id="TX-123", date=timezone.now(),
            amount=Decimal("30.00"), student=self.student, activity=self.trip,
        )
        self.assertEqual(tx.id, "TX-123")
        self.assertEqual(tx.amount, Decimal("30.00"))

    def test_protect_delete_student(self):
        Transaction.objects.create(
            id="TX-456", date=timezone.now(),
            amount=Decimal("30.00"), student=self.student, activity=self.trip,
        )
        from django.db.models import ProtectedError
        with self.assertRaises(ProtectedError):
            self.student.delete()

    def test_protect_delete_field_trip(self):
        Transaction.objects.create(
            id="TX-789", date=timezone.now(),
            amount=Decimal("30.00"), student=self.student, activity=self.trip,
        )
        from django.db.models import ProtectedError
        with self.assertRaises(ProtectedError):
            self.trip.delete()


# ---------------------------------------------------------------------------
# Serializer Tests
# ---------------------------------------------------------------------------

class FieldTripSerializerTests(TestCase):
    def setUp(self):
        self.school = School.objects.create(name="Test School")
        self.trip = FieldTrip.objects.create(
            location="Museum", cost=25.50, date=timezone.now()
        )

    def test_serialized_fields(self):
        serializer = FieldTripSerializer(self.trip)
        data = serializer.data
        self.assertIn("id", data)
        self.assertIn("location", data)
        self.assertIn("cost", data)
        self.assertIn("date", data)
        self.assertIn("schools", data)

    def test_schools_field_contains_all_schools(self):
        School.objects.create(name="School B")
        serializer = FieldTripSerializer(self.trip)
        schools = serializer.data["schools"]
        self.assertEqual(len(schools), 2)
        names = {s["name"] for s in schools}
        self.assertIn("Test School", names)
        self.assertIn("School B", names)


class FieldTripPaymentSerializerCardNumberTests(TestCase):
    def _base_data(self, **overrides):
        data = {
            "student_first_name": "Bart",
            "student_last_name": "Simpson",
            "parent_first_name": "Homer",
            "parent_last_name": "Simpson",
            "field_trip_id": str(uuid.uuid4()),
            "card_number": "1234567890123456",
            "expiry_date": "12/25",
            "cvv": "123",
            "email": "homer@example.com",
            "school_id": str(uuid.uuid4()),
        }
        data.update(overrides)
        return data

    def test_valid_card_number(self):
        s = FieldTripPaymentSerializer(data=self._base_data())
        self.assertTrue(s.is_valid(), s.errors)

    def test_card_number_too_short(self):
        s = FieldTripPaymentSerializer(data=self._base_data(card_number="123456789012345"))
        self.assertFalse(s.is_valid())
        self.assertIn("card_number", s.errors)

    def test_card_number_too_long(self):
        s = FieldTripPaymentSerializer(data=self._base_data(card_number="12345678901234567"))
        self.assertFalse(s.is_valid())
        self.assertIn("card_number", s.errors)

    def test_card_number_non_digits(self):
        s = FieldTripPaymentSerializer(data=self._base_data(card_number="12345678abcd3456"))
        self.assertFalse(s.is_valid())
        self.assertIn("card_number", s.errors)

    def test_card_number_with_spaces(self):
        s = FieldTripPaymentSerializer(data=self._base_data(card_number="1234 5678 9012 3456"))
        self.assertFalse(s.is_valid())
        self.assertIn("card_number", s.errors)


class FieldTripPaymentSerializerCVVTests(TestCase):
    def _base_data(self, **overrides):
        data = {
            "student_first_name": "Bart",
            "student_last_name": "Simpson",
            "parent_first_name": "Homer",
            "parent_last_name": "Simpson",
            "field_trip_id": str(uuid.uuid4()),
            "card_number": "1234567890123456",
            "expiry_date": "12/25",
            "cvv": "123",
            "email": "homer@example.com",
            "school_id": str(uuid.uuid4()),
        }
        data.update(overrides)
        return data

    def test_valid_cvv(self):
        s = FieldTripPaymentSerializer(data=self._base_data())
        self.assertTrue(s.is_valid(), s.errors)

    def test_cvv_too_short(self):
        s = FieldTripPaymentSerializer(data=self._base_data(cvv="12"))
        self.assertFalse(s.is_valid())
        self.assertIn("cvv", s.errors)

    def test_cvv_too_long(self):
        s = FieldTripPaymentSerializer(data=self._base_data(cvv="1234"))
        self.assertFalse(s.is_valid())
        self.assertIn("cvv", s.errors)

    def test_cvv_non_digits(self):
        s = FieldTripPaymentSerializer(data=self._base_data(cvv="12a"))
        self.assertFalse(s.is_valid())
        self.assertIn("cvv", s.errors)


class FieldTripPaymentSerializerExpiryDateTests(TestCase):
    def _base_data(self, **overrides):
        data = {
            "student_first_name": "Bart",
            "student_last_name": "Simpson",
            "parent_first_name": "Homer",
            "parent_last_name": "Simpson",
            "field_trip_id": str(uuid.uuid4()),
            "card_number": "1234567890123456",
            "expiry_date": "12/25",
            "cvv": "123",
            "email": "homer@example.com",
            "school_id": str(uuid.uuid4()),
        }
        data.update(overrides)
        return data

    def test_valid_expiry(self):
        s = FieldTripPaymentSerializer(data=self._base_data(expiry_date="01/26"))
        self.assertTrue(s.is_valid(), s.errors)

    def test_valid_expiry_december(self):
        s = FieldTripPaymentSerializer(data=self._base_data(expiry_date="12/30"))
        self.assertTrue(s.is_valid(), s.errors)

    def test_invalid_month_00(self):
        s = FieldTripPaymentSerializer(data=self._base_data(expiry_date="00/25"))
        self.assertFalse(s.is_valid())
        self.assertIn("expiry_date", s.errors)

    def test_invalid_month_13(self):
        s = FieldTripPaymentSerializer(data=self._base_data(expiry_date="13/25"))
        self.assertFalse(s.is_valid())
        self.assertIn("expiry_date", s.errors)

    def test_wrong_format_no_slash(self):
        s = FieldTripPaymentSerializer(data=self._base_data(expiry_date="1225"))
        self.assertFalse(s.is_valid())
        self.assertIn("expiry_date", s.errors)

    def test_wrong_format_full_year(self):
        s = FieldTripPaymentSerializer(data=self._base_data(expiry_date="12/2025"))
        self.assertFalse(s.is_valid())
        self.assertIn("expiry_date", s.errors)

    def test_wrong_format_single_digit_month(self):
        s = FieldTripPaymentSerializer(data=self._base_data(expiry_date="1/25"))
        self.assertFalse(s.is_valid())
        self.assertIn("expiry_date", s.errors)


class FieldTripPaymentSerializerRequiredFieldTests(TestCase):
    def test_missing_student_first_name(self):
        data = {
            "student_last_name": "Simpson",
            "parent_first_name": "Homer",
            "parent_last_name": "Simpson",
            "field_trip_id": str(uuid.uuid4()),
            "card_number": "1234567890123456",
            "expiry_date": "12/25",
            "cvv": "123",
            "email": "homer@example.com",
            "school_id": str(uuid.uuid4()),
        }
        s = FieldTripPaymentSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn("student_first_name", s.errors)

    def test_missing_email(self):
        data = {
            "student_first_name": "Bart",
            "student_last_name": "Simpson",
            "parent_first_name": "Homer",
            "parent_last_name": "Simpson",
            "field_trip_id": str(uuid.uuid4()),
            "card_number": "1234567890123456",
            "expiry_date": "12/25",
            "cvv": "123",
            "school_id": str(uuid.uuid4()),
        }
        s = FieldTripPaymentSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn("email", s.errors)

    def test_invalid_email(self):
        data = {
            "student_first_name": "Bart",
            "student_last_name": "Simpson",
            "parent_first_name": "Homer",
            "parent_last_name": "Simpson",
            "field_trip_id": str(uuid.uuid4()),
            "card_number": "1234567890123456",
            "expiry_date": "12/25",
            "cvv": "123",
            "email": "not-an-email",
            "school_id": str(uuid.uuid4()),
        }
        s = FieldTripPaymentSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn("email", s.errors)


# ---------------------------------------------------------------------------
# View Tests
# ---------------------------------------------------------------------------

class FieldTripViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.trip1 = FieldTrip.objects.create(
            location="Museum", cost=25.50, date=timezone.now()
        )
        self.trip2 = FieldTrip.objects.create(
            location="Zoo", cost=15.00, date=timezone.now()
        )

    def test_list_field_trips(self):
        response = self.client.get("/api/fieldtrip")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_list_empty(self):
        FieldTrip.objects.all().delete()
        response = self.client.get("/api/fieldtrip")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_response_contains_expected_fields(self):
        response = self.client.get("/api/fieldtrip")
        trip = response.data[0]
        self.assertIn("id", trip)
        self.assertIn("location", trip)
        self.assertIn("cost", trip)
        self.assertIn("date", trip)
        self.assertIn("schools", trip)


@patch("backend.api.views.LegacyPaymentProcessor")
class FieldTripPaymentViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.school = School.objects.create(name="Test School")
        self.trip = FieldTrip.objects.create(
            location="Museum", cost=25.50, date=timezone.now()
        )

    def _payment_data(self, **overrides):
        data = {
            "student_first_name": "Bart",
            "student_last_name": "Simpson",
            "parent_first_name": "Homer",
            "parent_last_name": "Simpson",
            "field_trip_id": str(self.trip.id),
            "card_number": "1234567890123456",
            "expiry_date": "12/25",
            "cvv": "123",
            "email": "homer@example.com",
            "school_id": str(self.school.id),
        }
        data.update(overrides)
        return data

    def _mock_success(self, mock_processor_cls):
        mock_instance = MagicMock()
        mock_instance.process_payment.return_value = PaymentResponse(
            success=True, transaction_id="TX-TEST-001"
        )
        mock_processor_cls.return_value = mock_instance
        return mock_instance

    def _mock_failure(self, mock_processor_cls, error="Payment declined"):
        mock_instance = MagicMock()
        mock_instance.process_payment.return_value = PaymentResponse(
            success=False, error_message=error
        )
        mock_processor_cls.return_value = mock_instance
        return mock_instance

    def test_successful_payment_returns_201(self, mock_processor_cls):
        self._mock_success(mock_processor_cls)
        response = self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(response.status_code, 201)

    def test_successful_payment_creates_transaction(self, mock_processor_cls):
        self._mock_success(mock_processor_cls)
        self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(Transaction.objects.count(), 1)
        tx = Transaction.objects.first()
        self.assertEqual(tx.id, "TX-TEST-001")
        self.assertEqual(tx.amount, Decimal("25.5"))

    def test_successful_payment_creates_parent(self, mock_processor_cls):
        self._mock_success(mock_processor_cls)
        self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(Parent.objects.count(), 1)
        parent = Parent.objects.first()
        self.assertEqual(parent.first_name, "Homer")
        self.assertEqual(parent.last_name, "Simpson")
        self.assertEqual(parent.email, "homer@example.com")

    def test_successful_payment_creates_student(self, mock_processor_cls):
        self._mock_success(mock_processor_cls)
        self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(Student.objects.count(), 1)
        student = Student.objects.first()
        self.assertEqual(student.first_name, "Bart")
        self.assertEqual(student.school, self.school)

    def test_successful_payment_creates_registration(self, mock_processor_cls):
        self._mock_success(mock_processor_cls)
        self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(FieldTripRegistration.objects.count(), 1)
        reg = FieldTripRegistration.objects.first()
        self.assertEqual(reg.field_trip, self.trip)

    def test_duplicate_payment_reuses_parent(self, mock_processor_cls):
        self._mock_success(mock_processor_cls)
        self.client.post("/api/payment", self._payment_data(), format="json")
        # Reset mock to return a different TX id
        mock_instance = mock_processor_cls.return_value
        mock_instance.process_payment.return_value = PaymentResponse(
            success=True, transaction_id="TX-TEST-002"
        )
        self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(Parent.objects.count(), 1)
        self.assertEqual(Transaction.objects.count(), 2)

    def test_nonexistent_school_returns_400(self, mock_processor_cls):
        self._mock_success(mock_processor_cls)
        data = self._payment_data(school_id=str(uuid.uuid4()))
        response = self.client.post("/api/payment", data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_nonexistent_field_trip_returns_400(self, mock_processor_cls):
        self._mock_success(mock_processor_cls)
        data = self._payment_data(field_trip_id=str(uuid.uuid4()))
        response = self.client.post("/api/payment", data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_payment_failure_returns_400(self, mock_processor_cls):
        self._mock_failure(mock_processor_cls, error="Card declined")
        response = self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(response.status_code, 400)

    def test_payment_failure_does_not_create_transaction(self, mock_processor_cls):
        self._mock_failure(mock_processor_cls)
        self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(Transaction.objects.count(), 0)

    def test_payment_failure_still_creates_parent_student_registration(self, mock_processor_cls):
        self._mock_failure(mock_processor_cls)
        self.client.post("/api/payment", self._payment_data(), format="json")
        self.assertEqual(Parent.objects.count(), 1)
        self.assertEqual(Student.objects.count(), 1)
        self.assertEqual(FieldTripRegistration.objects.count(), 1)

    def test_invalid_card_returns_400(self, mock_processor_cls):
        data = self._payment_data(card_number="123")
        response = self.client.post("/api/payment", data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_invalid_cvv_returns_400(self, mock_processor_cls):
        data = self._payment_data(cvv="12")
        response = self.client.post("/api/payment", data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_invalid_expiry_returns_400(self, mock_processor_cls):
        data = self._payment_data(expiry_date="13/25")
        response = self.client.post("/api/payment", data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_payment_processor_receives_correct_data(self, mock_processor_cls):
        mock_instance = self._mock_success(mock_processor_cls)
        self.client.post("/api/payment", self._payment_data(), format="json")
        call_args = mock_instance.process_payment.call_args[0][0]
        self.assertEqual(call_args["student_name"], "Bart Simpson")
        self.assertEqual(call_args["parent_name"], "Homer Simpson")
        self.assertEqual(call_args["amount"], self.trip.cost)
        self.assertEqual(call_args["card_number"], "1234567890123456")
        self.assertEqual(call_args["expiry_date"], "12/25")
        self.assertEqual(call_args["cvv"], "123")


# ---------------------------------------------------------------------------
# LegacyPaymentProcessor Tests
# ---------------------------------------------------------------------------

class LegacyPaymentProcessorTests(TestCase):
    def setUp(self):
        self.processor = LegacyPaymentProcessor()
        self.valid_data = {
            "student_name": "Bart Simpson",
            "parent_name": "Homer Simpson",
            "amount": 25.50,
            "card_number": "1234567890123456",
            "expiry_date": "12/25",
            "cvv": "123",
            "school_id": "school-1",
            "activity_id": "activity-1",
        }

    @patch("backend.legacy_api.random.random", return_value=0.5)
    @patch("backend.legacy_api.time.sleep")
    def test_successful_payment(self, mock_sleep, mock_random):
        response = self.processor.process_payment(self.valid_data)
        self.assertTrue(response.success)
        self.assertIsNotNone(response.transaction_id)
        self.assertTrue(response.transaction_id.startswith("TX-"))

    @patch("backend.legacy_api.random.random", return_value=0.5)
    @patch("backend.legacy_api.time.sleep")
    def test_simulated_processing_delay(self, mock_sleep, mock_random):
        self.processor.process_payment(self.valid_data)
        mock_sleep.assert_called_once_with(1.5)

    @patch("backend.legacy_api.random.random", return_value=0.05)
    @patch("backend.legacy_api.time.sleep")
    def test_random_failure(self, mock_sleep, mock_random):
        response = self.processor.process_payment(self.valid_data)
        self.assertFalse(response.success)
        self.assertIn("declined", response.error_message)

    def test_missing_required_field(self):
        for field in ["student_name", "parent_name", "amount", "card_number",
                       "expiry_date", "cvv", "school_id", "activity_id"]:
            data = self.valid_data.copy()
            del data[field]
            response = self.processor.process_payment(data)
            self.assertFalse(response.success, f"Should fail when missing {field}")
            self.assertIn(field, response.error_message)

    def test_invalid_card_number_non_digits(self):
        data = {**self.valid_data, "card_number": "12345678abcd3456"}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)
        self.assertIn("card number", response.error_message.lower())

    def test_invalid_card_number_wrong_length(self):
        data = {**self.valid_data, "card_number": "12345"}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)

    def test_invalid_expiry_wrong_format(self):
        data = {**self.valid_data, "expiry_date": "1225"}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)
        self.assertIn("expiry", response.error_message.lower())

    def test_invalid_expiry_month_zero(self):
        data = {**self.valid_data, "expiry_date": "00/25"}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)

    def test_invalid_expiry_month_13(self):
        data = {**self.valid_data, "expiry_date": "13/25"}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)

    def test_invalid_cvv_non_digits(self):
        data = {**self.valid_data, "cvv": "ab3"}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)
        self.assertIn("CVV", response.error_message)

    def test_invalid_cvv_wrong_length(self):
        data = {**self.valid_data, "cvv": "1234"}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)

    def test_negative_amount(self):
        data = {**self.valid_data, "amount": -10}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)
        self.assertIn("positive", response.error_message.lower())

    def test_zero_amount(self):
        data = {**self.valid_data, "amount": 0}
        response = self.processor.process_payment(data)
        self.assertFalse(response.success)

    def test_card_number_with_spaces_accepted(self):
        """The legacy processor strips spaces from card numbers."""
        data = {**self.valid_data, "card_number": "1234 5678 9012 3456"}
        # The processor replaces spaces, so 16 digits with spaces = valid
        with patch("backend.legacy_api.time.sleep"), \
             patch("backend.legacy_api.random.random", return_value=0.5):
            response = self.processor.process_payment(data)
        self.assertTrue(response.success)
