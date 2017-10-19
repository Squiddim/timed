from django.conf import settings
from rest_framework.routers import DefaultRouter

from . import views

r = DefaultRouter(trailing_slash=settings.APPEND_SLASH)

r.register(r'work-reports',     views.WorkReportViewSet,    'work-report')
r.register(r'year-statistics',  views.YearStatisticViewSet, 'year-statistic')
r.register(r'month-statistics', views.MonthStatisticViewSet, 'month-statistic')

urlpatterns = r.urls
