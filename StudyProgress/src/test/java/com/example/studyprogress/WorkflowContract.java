package com.example.studyprogress;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Value;
import java.net.*;
import java.net.http.*;
import java.util.*;
import tools.jackson.databind.*;
import static org.junit.jupiter.api.Assertions.*;
abstract class WorkflowContract {
    @Value("${local.server.port}") int port;
    final HttpClient http=HttpClient.newHttpClient();
    final ObjectMapper json=new ObjectMapper();
    record Result(int status,JsonNode body,HttpResponse<String> response){}
    Result call(String method,String path,String body,String token,String...headers)throws Exception{
        var b=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path)).header("Content-Type","application/json");
        if(token!=null)b.header("Authorization","Bearer "+token);
        for(int i=0;i<headers.length;i+=2)b.header(headers[i],headers[i+1]);
        b.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(body));
        var res=http.send(b.build(),HttpResponse.BodyHandlers.ofString());
        return new Result(res.statusCode(),res.body().isBlank()?json.nullNode():(res.headers().firstValue("content-type").orElse("").contains("json")?json.readTree(res.body()):json.createObjectNode().put("message",res.body())),res);
    }
    String email(){return "test-"+UUID.randomUUID()+"@example.invalid";}
    String registerAndLogin(String email)throws Exception{
        var r=call("POST","/api/v1/auth/registro","{\"nombre\":\"Estudiante Test\",\"email\":\""+email+"\",\"password\":\"TestPass123\"}",null);
        assertEquals(201,r.status());assertFalse(r.body().has("password"));
        return login(email).body().get("token").asText();
    }
    Result login(String email)throws Exception{return call("POST","/api/v1/auth/login","{\"email\":\""+email+"\",\"password\":\"TestPass123\"}",null);}
    long course(String token,String name)throws Exception{var r=call("POST","/api/v1/cursos","{\"nombre\":\""+name+"\",\"descripcion\":\"Curso test\"}",token);assertEquals(201,r.status());return r.body().get("id").asLong();}
    String taskBody(){return "{\"titulo\":\"Resolver proyecto\",\"descripcion\":\"Test\",\"fechaLimite\":\"2099-12-01\",\"prioridad\":\"ALTA\"}";}
    @Test void unauthenticatedRequestsReturn401()throws Exception{assertEquals(401,call("GET","/api/v1/cursos",null,null).status());assertEquals(200,call("GET","/health",null,null).status());}
    @Test void registrationDuplicateAndInvalidCredentials()throws Exception{String e=email();registerAndLogin(e);assertEquals(409,call("POST","/api/v1/auth/registro","{\"nombre\":\"Test User\",\"email\":\""+e+"\",\"password\":\"TestPass123\"}",null).status());assertEquals(401,call("POST","/api/v1/auth/login","{\"email\":\""+e+"\",\"password\":\"incorrecta\"}",null).status());}
    @Test void coursesAreFilteredPaginatedAndScoped()throws Exception{
        String a=registerAndLogin(email()),b=registerAndLogin(email());for(int i=0;i<12;i++)course(a,"Matemática "+i);course(b,"Privado");
        var p=call("GET","/api/v1/cursos?page=1&size=10&search=Matem&sort=nombre",null,a);assertEquals(200,p.status());assertEquals(12,p.body().get("total").asInt());assertEquals(2,p.body().get("content").size());
        assertEquals(1,call("GET","/api/v1/cursos",null,b).body().get("total").asInt());
    }
    @Test void anotherUserCannotReadEditOrDeleteCourse()throws Exception{String a=registerAndLogin(email()),b=registerAndLogin(email());long id=course(a,"Privado");assertEquals(403,call("GET","/api/v1/cursos/"+id,null,b).status());assertEquals(403,call("PUT","/api/v1/cursos/"+id,"{\"nombre\":\"Hack\",\"descripcion\":\"\"}",b).status());assertEquals(403,call("DELETE","/api/v1/cursos/"+id,null,b).status());}
    @Test void taskPaginationCompletionAndPointsArePersistent()throws Exception{
        String a=registerAndLogin(email());long c=course(a,"Curso completo");long id=0;for(int i=0;i<11;i++){var t=call("POST","/api/v1/cursos/"+c+"/tareas",taskBody(),a);assertEquals(201,t.status());id=t.body().get("id").asLong();}
        var page=call("GET","/api/v1/tareas?page=1&size=10",null,a);assertEquals(11,page.body().get("total").asInt());assertEquals(1,page.body().get("content").size());
        assertEquals(200,call("PATCH","/api/v1/tareas/"+id+"/completar",null,a).status());int points=call("GET","/api/v1/auth/me",null,a).body().get("puntos").asInt();assertTrue(points>0);
        call("PATCH","/api/v1/tareas/"+id+"/completar",null,a);assertEquals(points,call("GET","/api/v1/auth/me",null,a).body().get("puntos").asInt());
        assertEquals(1,call("GET","/api/v1/dashboard",null,a).body().get("tareasCompletadas").asInt());
    }
    @Test void invalidTaskAndPaginationReturn400()throws Exception{String a=registerAndLogin(email());long c=course(a,"Validación");assertEquals(400,call("POST","/api/v1/cursos/"+c+"/tareas","{\"titulo\":\"x\"}",a).status());assertEquals(400,call("GET","/api/v1/cursos?size=10000",null,a).status());assertEquals(400,call("GET","/api/v1/tareas?sort=password",null,a).status());assertEquals(400,call("GET","/api/v1/cursos?page=abc",null,a).status());}
    @Test void browserRefreshCookieRotatesAndLogoutRevokes()throws Exception{
        String e=email();registerAndLogin(e);var l=login(e);String cookie=l.response().headers().firstValue("set-cookie").orElseThrow();assertTrue(cookie.contains("HttpOnly"));assertTrue(cookie.contains("SameSite=Strict"));assertFalse(l.body().has("refreshToken"));
        String old=cookie.split(";",2)[0];var fresh=call("POST","/api/v1/auth/refresh","{}",null,"Cookie",old,"Origin","http://localhost:5173");assertEquals(200,fresh.status());
        assertEquals(401,call("POST","/api/v1/auth/refresh","{}",null,"Cookie",old).status());String next=fresh.response().headers().firstValue("set-cookie").orElseThrow().split(";",2)[0];
        assertEquals(204,call("POST","/api/v1/auth/logout","{}",null,"Cookie",next).status());assertEquals(401,call("POST","/api/v1/auth/refresh","{}",null,"Cookie",next).status());
    }
    @Test void nativeRefreshUsesBodyAndRotates()throws Exception{String e=email();registerAndLogin(e);var l=call("POST","/api/v1/auth/login","{\"email\":\""+e+"\",\"password\":\"TestPass123\"}",null,"X-Client","native");assertTrue(l.body().has("refreshToken"));String refresh=l.body().get("refreshToken").asText();var f=call("POST","/api/v1/auth/refresh","{\"refreshToken\":\""+refresh+"\"}",null,"X-Client","native");assertEquals(200,f.status());assertNotEquals(refresh,f.body().get("refreshToken").asText());assertEquals(401,call("POST","/api/v1/auth/refresh","{\"refreshToken\":\""+refresh+"\"}",null,"X-Client","native").status());}
    @Test void crossSiteSessionChangesAreForbidden()throws Exception{assertEquals(403,call("POST","/api/v1/auth/refresh","{}",null,"Origin","https://evil.example").status());assertEquals(403,call("POST","/api/v1/auth/logout","{}",null,"Sec-Fetch-Site","cross-site").status());}
    @Test void qrImportAndCascadeDeleteAreAtomic()throws Exception{String a=registerAndLogin(email());var imported=call("POST","/api/v1/cursos/importar","{\"nombre\":\"Curso QR\",\"descripcion\":\"Compartido\",\"temas\":[\"React\",\"Spring Boot\"]}",a);assertEquals(201,imported.status());long id=imported.body().get("id").asLong();assertEquals(2,call("GET","/api/v1/cursos/"+id,null,a).body().get("temas").size());call("POST","/api/v1/cursos/"+id+"/tareas",taskBody(),a);assertEquals(204,call("DELETE","/api/v1/cursos/"+id,null,a).status());assertEquals(404,call("GET","/api/v1/cursos/"+id,null,a).status());assertEquals(0,call("GET","/api/v1/tareas",null,a).body().get("total").asInt());}
    @Test void goalsRemindersAndEvaluationsCanBeEdited()throws Exception{
        String a=registerAndLogin(email());long c=course(a,"Curso notas");String eb="{\"titulo\":\"Examen final\",\"descripcion\":\"\",\"fecha\":\"2099-12-01\",\"tipo\":\"EXAMEN\",\"ponderacion\":40}";
        var e=call("POST","/api/v1/cursos/"+c+"/evaluaciones",eb,a);assertEquals(201,e.status());long eid=e.body().get("id").asLong();assertEquals(200,call("PUT","/api/v1/evaluaciones/"+eid,eb,a).status());assertEquals(200,call("PATCH","/api/v1/evaluaciones/"+eid+"/calificacion","{\"calificacion\":18}",a).status());
        String gb="{\"titulo\":\"Estudiar React\",\"descripcion\":\"\",\"fechaLimite\":\"2099-12-01\"}";var g=call("POST","/api/v1/objetivos",gb,a);assertEquals(201,g.status());assertEquals(200,call("PUT","/api/v1/objetivos/"+g.body().get("id").asLong(),gb,a).status());assertEquals(200,call("PATCH","/api/v1/objetivos/"+g.body().get("id").asLong()+"/completar",null,a).status());
        String rb="{\"titulo\":\"Repasar curso\",\"descripcion\":\"\",\"fechaHora\":\"2099-12-01T18:00:00\"}";var remind=call("POST","/api/v1/recordatorios",rb,a);assertEquals(201,remind.status());assertEquals(200,call("PUT","/api/v1/recordatorios/"+remind.body().get("id").asLong(),rb,a).status());
    }
}
