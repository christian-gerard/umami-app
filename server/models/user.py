from . import SerializerMixin, validates, re, db
from sqlalchemy.ext.hybrid import hybrid_property
from config import flask_bcrypt
from datetime import datetime
import re

class User(db.Model, SerializerMixin):
    # # # # # Table Name
    __tablename__ = 'users'

    # # # # # Attribute
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String, nullable=False)
    role = db.Column(db.Integer, nullable=False)
    _password_hash = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.now())
    updated_at = db.Column(db.DateTime, onupdate=datetime.now())

    # # # # # Relationship
    recipes = db.relationship('Recipe', back_populates='user', cascade='all, delete')

    # # # # # Serialize
    serialize_rules=()

    # # # # # Representation
    def __repr__(self):
        return f"""
            <User {self.id}
                username: {self.username}
                created_at: {self.created_at}
                />
        """

    # # # # # Property
    @validates('username')
    def validate_username(self, key, username):
        assert username, "Username must be provided"
        assert len(username) < 21, "Username must not be over 20 characters"
        return username

    @validates('email')
    def validate_email(self,key,email):
        assert '@' in email, 'Email address must contain @ symbol'
        assert '.' in email.split('@')[1], 'Email address must contain domain'
        return email

    @validates('role')
    def validate_role(self,key,role):
        roles = ( 0, 1)
        assert role, "Must provide an integer for role"
        assert role in roles, "Must be a valid role integer"
        return role

    # # # # # Hybrid Property
    @hybrid_property
    def password_hash(self):
        raise AttributeError('Access to password is restricted')

    @password_hash.setter
    def password_hash(self, new_password):
        if not len(new_password) >= 8:
            raise ValueError('Password must be 8 or more characters')
        elif not re.search(r"[$&+,:;=?@#|'<>.-^*()%!]",new_password):
            raise ValueError('Password must contain special characters')
        elif not re.search(r"[A-Z]",new_password):
            raise ValueError('Password must contain at least one capital letter')
        elif not re.search(r"[a-z]",new_password):
            raise ValueError('Password must contain at least one lowercase letter')
        elif not re.search(r"[0-9]",new_password):
            raise ValueError('Password must contain at least one number')
        else:
            hashed_password = flask_bcrypt.generate_password_hash(new_password).decode('utf-8')
            self._password_hash = hashed_password

    def authenticate(self, password_to_check):
        return flask_bcrypt.check_password_hash(self._password_hash, password_to_check)