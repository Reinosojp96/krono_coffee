from enum import Enum

class Role(str, Enum):
    """
    Enumerador para los roles de usuario.
    """
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"
    CUSTOMER = "CUSTOMER"

class OrderStatus(str, Enum):
    """
    Enumerador para los estados de un pedido.
    """
    PENDING = "PENDING"
    IN_PREPARATION = "IN_PREPARATION"
    READY_FOR_DELIVERY = "READY_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class PaymentMethod(str, Enum):
    """
    Enumerador para los métodos de pago.
    """
    CASH = "CASH"
    NEQUI_QR = "NEQUI_QR"
    NEQUI_PHONE = "NEQUI_PHONE"
    CARD = "CARD"
class PaymentStatus(str, Enum):
    """
    Enumerador para los estados de un pago.
    """
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"
