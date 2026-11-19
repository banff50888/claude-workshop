"""
Tests for shipments API endpoints.
"""
import pytest

VALID_STATUSES = ["preparing", "in transit", "out for delivery", "delivered", "delayed"]


class TestShipmentsEndpoints:
    """Test suite for shipment-related endpoints."""

    def test_get_all_shipments(self, client):
        """Test getting all shipments."""
        response = client.get("/api/shipments")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        first = data[0]
        for field in [
            "id", "shipment_number", "order_id", "order_number", "order_date",
            "customer", "carrier", "tracking_number", "status", "warehouse",
            "category", "destination", "packages", "weight_kg",
            "ship_date", "estimated_delivery", "actual_delivery",
        ]:
            assert field in first

    def test_get_shipments_by_warehouse(self, client):
        """Test filtering shipments by warehouse."""
        response = client.get("/api/shipments?warehouse=Tokyo")
        assert response.status_code == 200

        data = response.json()
        assert len(data) > 0
        for shipment in data:
            assert shipment["warehouse"] == "Tokyo"

    def test_get_shipments_by_category(self, client):
        """Test filtering shipments by category."""
        response = client.get("/api/shipments?category=Sensors")
        assert response.status_code == 200

        data = response.json()
        assert len(data) > 0
        for shipment in data:
            assert shipment["category"].lower() == "sensors"

    def test_get_shipments_by_status(self, client):
        """Test filtering shipments by status."""
        response = client.get("/api/shipments?status=Delivered")
        assert response.status_code == 200

        data = response.json()
        assert len(data) > 0
        for shipment in data:
            assert shipment["status"].lower() == "delivered"

    def test_get_shipments_by_month(self, client):
        """Test filtering shipments by month."""
        response = client.get("/api/shipments?month=2025-03")
        assert response.status_code == 200

        for shipment in response.json():
            assert shipment["order_date"].startswith("2025-03")

    def test_get_shipments_by_quarter(self, client):
        """Test filtering shipments by quarter."""
        response = client.get("/api/shipments?month=Q1-2025")
        assert response.status_code == 200

        data = response.json()
        assert len(data) > 0
        for shipment in data:
            assert shipment["order_date"][:7] in ["2025-01", "2025-02", "2025-03"]

    def test_get_shipments_multiple_filters(self, client):
        """Test filtering shipments with multiple filters."""
        response = client.get(
            "/api/shipments?warehouse=London&category=Sensors&status=Delivered"
        )
        assert response.status_code == 200

        for shipment in response.json():
            assert shipment["warehouse"] == "London"
            assert shipment["category"].lower() == "sensors"
            assert shipment["status"].lower() == "delivered"

    def test_get_shipment_by_id(self, client):
        """Test getting a specific shipment by ID."""
        all_shipments = client.get("/api/shipments").json()
        shipment_id = all_shipments[0]["id"]

        response = client.get(f"/api/shipments/{shipment_id}")
        assert response.status_code == 200
        assert response.json()["id"] == shipment_id

    def test_get_nonexistent_shipment(self, client):
        """Test getting a shipment that doesn't exist."""
        response = client.get("/api/shipments/nonexistent-shipment-999")
        assert response.status_code == 404

        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()

    def test_shipment_status_values(self, client):
        """Test that shipments have valid status values."""
        for shipment in client.get("/api/shipments").json():
            assert shipment["status"].lower() in VALID_STATUSES

    def test_shipment_numeric_types(self, client):
        """Test that numeric fields have proper types and ranges."""
        for shipment in client.get("/api/shipments").json():
            assert isinstance(shipment["packages"], int)
            assert isinstance(shipment["weight_kg"], (int, float))
            assert shipment["packages"] >= 1
            assert shipment["weight_kg"] > 0

    def test_delivered_shipments_have_actual_delivery(self, client):
        """Test that delivered shipments have an actual delivery date."""
        for shipment in client.get("/api/shipments").json():
            if shipment["status"].lower() == "delivered":
                assert shipment["actual_delivery"] is not None
            else:
                assert shipment["actual_delivery"] is None

    def test_shipments_reference_valid_orders(self, client):
        """Test that every shipment links to an existing order."""
        # orders.json contains a few repeated ids/order numbers, so match on the pair
        order_keys = {(o["id"], o["order_number"]) for o in client.get("/api/orders").json()}

        for shipment in client.get("/api/shipments").json():
            assert (shipment["order_id"], shipment["order_number"]) in order_keys
